const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

async function getOrCreateWallet(userId, session) {
  let wallet = await Wallet.findOne({ userId }).session(session || null);
  if (!wallet) {
    const created = await Wallet.create([{ userId, balances: {} }], { session });
    wallet = created[0];
  }
  return wallet;
}

/**
 * Atomically credits a wallet and writes a ledger transaction.
 * Must be called within a Mongoose session/transaction from the caller
 * so that the wallet update and the ledger entry are all-or-nothing.
 */
async function creditWallet({ userId, currency, amount, streakDay, session }) {
  const wallet = await getOrCreateWallet(userId, session);

  const balanceBefore = wallet.balances.get(currency) || 0;
  const balanceAfter = balanceBefore + amount;

  wallet.balances.set(currency, balanceAfter);
  await wallet.save({ session });

  const transaction = await WalletTransaction.create(
    [
      {
        transactionId: WalletTransaction.generateTransactionId(),
        userId,
        currency,
        type: 'CREDIT',
        amount,
        source: 'DAILY_STREAK',
        referenceId: WalletTransaction.generateReferenceId(),
        streakDay,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
      },
    ],
    { session }
  );

  return { wallet, transaction: transaction[0] };
}

module.exports = { getOrCreateWallet, creditWallet };
