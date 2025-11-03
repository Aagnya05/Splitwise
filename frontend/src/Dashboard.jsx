
import React, { useState, useEffect, useCallback } from "react";
import { PersonAPI as Person, ExpenseAPI as Expense } from "./apiClient";
// or "./apiClient" depending on where the file is
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Plus, DollarSign, Users, Receipt, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";

import StatCard from "./StatCard";
import RecentExpenses from "./RecentExpenses";
import BalanceOverview from "./BalanceOverview";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balances, setBalances] = useState({});

  const calculateBalances = useCallback((expenses, people) => {
    const balanceMap = {};
    
    // Initialize balances
    people.forEach(person => {
      balanceMap[person.id] = 0;
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      expense.participants?.forEach(participant => {
        if (participant.person_id === expense.paid_by) {
          // Person paid and owes their share
          balanceMap[participant.person_id] += (expense.total_amount - participant.amount_owed);
        } else {
          // Person owes money
          balanceMap[participant.person_id] -= participant.amount_owed;
        }
      });
    });

    setBalances(balanceMap);
  }, []); // calculateBalances doesn't depend on any state/props, so an empty array is fine

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [expenseData, peopleData] = await Promise.all([
      Expense.list("-created_date", 20),
      Person.list()
    ]);
    setExpenses(expenseData);
    setPeople(peopleData);
    calculateBalances(expenseData, peopleData); // calculateBalances is now a stable dependency
    setIsLoading(false);
  }, [calculateBalances]); // loadData depends on calculateBalances

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total_amount, 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.expense_date || exp.created_date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600">Track your shared expenses and balances</p>
          </div>
          <Link to={createPageUrl("AddExpense")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toFixed(2)}`}
            icon={Receipt}
            gradient="from-blue-500 to-cyan-500"
            trend={`${expenses.length} transactions`}
          />
          <StatCard
            title="This Month"
            value={`₹${thisMonthExpenses.reduce((sum, exp) => sum + exp.total_amount, 0).toFixed(2)}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-green-500"
            trend={`${thisMonthExpenses.length} expenses`}
          />
          <StatCard
            title="Active People"
            value={people.length}
            icon={Users}
            gradient="from-purple-500 to-pink-500"
            trend="All time"
          />
          <StatCard
            title="You Owe"
            value={`₹${Math.max(0, -balances['current_user'] || 0).toFixed(2)}`}
            icon={ArrowUpRight}
            gradient="from-orange-500 to-red-500"
            trend="Total debt"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentExpenses 
              expenses={expenses}
              people={people}
              isLoading={isLoading}
            />
          </div>
          <div>
            <BalanceOverview 
              balances={balances}
              people={people}
              isLoading={isLoading}
              expenses={expenses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
