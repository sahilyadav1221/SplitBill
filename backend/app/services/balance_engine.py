from decimal import Decimal
from typing import List, Dict, Tuple
import heapq

class BalanceEngine:
    @staticmethod
    def minimize_cash_flow(net_balances: Dict[str, Decimal]) -> List[Dict]:
        """
        Implements the Minimize Cash Flow algorithm.
        Input: Dict mapping user_id (str) -> net_balance (Decimal)
        Output: List of transactions [{'from': user_id, 'to': user_id, 'amount': Decimal}]
        """
        
        # Filter out users with 0 balance
        creditors = [] # Max heap for positive balances (store as negative for min-heap behavior)
        debtors = []   # Max heap for negative balances (store as positive magnitude)

        for user, amount in net_balances.items():
            if amount > 0.01:
                # Python's heapq is a min-heap. We want max-heap behavior for the greedy approach.
                # So we store negative values for creditors to pop the "most positive" (closest to -inf? No.)
                # Wait, standard Python trick for max heap is storing -value.
                # Here specifically:
                # Creditor with +100. Store as -100. Pop smallest (-100). Convert back to +100.
                heapq.heappush(creditors, (-amount, user))
            elif amount < -0.01:
                # Debtor with -50. Magnitude is 50. Store as -50? 
                # We want the 'biggest' debtor (most negative).
                # -100 vs -50. -100 is "smaller" in number line but "bigger" debt.
                # If we use min-heap on raw values: -100 comes before -50. Correct.
                heapq.heappush(debtors, (amount, user))

        transactions = []

        while creditors and debtors:
            # Get the creditor with max credit and debtor with max debt
            credit_amount_neg, creditor_id = heapq.heappop(creditors)
            debt_amount_raw, debtor_id = heapq.heappop(debtors)
            
            credit_amount = -credit_amount_neg # Convert back to positive
            debt_amount = -debt_amount_raw     # Convert neg balance to positive magnitude 
                                               # Wait, if debtor has -100, debt_amount_raw is -100.
                                               # We want magnitude 100. So -(-100) = 100.

            # Determine the settlement amount being the minimum of debt or credit
            amount = min(credit_amount, debt_amount)
            
            # Record transaction
            transactions.append({
                "from": debtor_id,
                "to": creditor_id,
                "amount": amount
            })

            # Update balances
            remaining_credit = credit_amount - amount
            remaining_debt = debt_amount - amount

            # Push back if there's remaining balance
            if remaining_credit > 0.01:
                heapq.heappush(creditors, (-remaining_credit, creditor_id))
            
            if remaining_debt > 0.01:
                # Debtor still owes money. We popped -100 (debt), paid 50. Remaining debt -50.
                # Push back -50.
                heapq.heappush(debtors, (-remaining_debt, debtor_id))

        return transactions
