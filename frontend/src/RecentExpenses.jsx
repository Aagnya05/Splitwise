import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Receipt, User, DollarSign, ChevronDown, ChevronUp, Check, Clock } from "lucide-react";
import { PersonAPI as Person, ExpenseAPI as Expense } from "./apiClient";
// or "./apiClient" depending on where the file is

const categoryColors = {
  food: "bg-orange-100 text-orange-800 border-orange-200",
  transport: "bg-blue-100 text-blue-800 border-blue-200",
  accommodation: "bg-purple-100 text-purple-800 border-purple-200",
  entertainment: "bg-pink-100 text-pink-800 border-pink-200",
  shopping: "bg-green-100 text-green-800 border-green-200",
  utilities: "bg-yellow-100 text-yellow-800 border-yellow-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function RecentExpenses({ expenses, people, isLoading }) {
  const [expandedExpense, setExpandedExpense] = useState(null);
  
  const getPerson = (personId) => people.find(p => p.id === personId);

  const toggleExpanded = (expenseId) => {
    setExpandedExpense(expandedExpense === expenseId ? null : expenseId);
  };

  const handleSettlementToggle = async (expense, participantId, currentStatus) => {
    const updatedParticipants = expense.participants.map(p => 
      p.person_id === participantId 
        ? { ...p, is_settled: !currentStatus }
        : p
    );
    
    await Expense.update(expense.id, {
      ...expense,
      participants: updatedParticipants
    });
    
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-green-600" />
          Recent Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No expenses yet</p>
            <p className="text-gray-400">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map((expense, index) => {
              const paidBy = getPerson(expense.paid_by);
              const isExpanded = expandedExpense === expense.id;
              const settledCount = expense.participants?.filter(p => p.is_settled).length || 0;
              const totalParticipants = expense.participants?.length || 0;
              
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: paidBy?.avatar_color || '#10B981' }}
                        >
                          {paidBy?.name?.charAt(0) || <User className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              Paid by {paidBy?.name || 'Unknown'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(expense.expense_date || expense.created_date), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ₹{expense.total_amount.toFixed(2)}
                        </p>
                        <Badge 
                          className={`${categoryColors[expense.category]} border mt-1`}
                          variant="secondary"
                        >
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        {settledCount === totalParticipants ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">All settled</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-600 font-medium">
                              {settledCount}/{totalParticipants} paid
                            </span>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(expense.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Manage Payments
                          </>
                        )}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="font-semibold text-gray-900 mb-3">Payment Breakdown:</h5>
                            <div className="space-y-2">
                              {expense.participants?.map((participant) => {
                                const person = getPerson(participant.person_id);
                                const isPayer = participant.person_id === expense.paid_by;
                                
                                return (
                                  <div 
                                    key={participant.person_id} 
                                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                  >
                                    <Checkbox
                                      checked={participant.is_settled}
                                      onCheckedChange={() => handleSettlementToggle(expense, participant.person_id, participant.is_settled)}
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                      style={{ backgroundColor: person?.avatar_color || '#10B981' }}
                                    >
                                      {person?.name?.charAt(0) || <User className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {person?.name || 'Unknown'}
                                        {isPayer && (
                                          <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                            Paid Full
                                          </Badge>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Owes ₹{participant.amount_owed.toFixed(2)}
                                      </p>
                                    </div>
                                    <Badge 
                                      className={participant.is_settled 
                                        ? "bg-green-100 text-green-800 border-green-200" 
                                        : "bg-orange-100 text-orange-800 border-orange-200"
                                      }
                                      variant="outline"
                                    >
                                      {participant.is_settled ? (
                                        <>
                                          <Check className="w-3 h-3 mr-1" />
                                          Paid
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3 mr-1" />
                                          Pending
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                              ✓ Click the checkbox to mark payment as complete
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}