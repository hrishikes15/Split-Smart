// Greedy algorithm to minimize cash flow
const minimizeTransactions = (balances) => {
  // balances is an object like: { userId1: 500, userId2: -300, userId3: -200 }
  
  // Separate into debtors and creditors
  let debtors = [];
  let creditors = [];
  
  for (const [userId, amount] of Object.entries(balances)) {
    if (amount < 0) {
      debtors.push({ userId, amount: Math.abs(amount) });
    } else if (amount > 0) {
      creditors.push({ userId, amount });
    }
  }

  // Sort by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settledAmount
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
};

module.exports = { minimizeTransactions };
