import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "./components/ui/card.jsx";
import { Badge } from "./components/ui/badge.jsx";
import { Button } from "./components/ui/button.jsx";
import { Skeleton } from "./components/ui/skeleton.jsx";
import { Checkbox } from "./components/ui/checkbox.jsx";
import { format, parseISO } from "date-fns";
import { Receipt, Users, DollarSign, ChevronDown, ChevronUp, Check, Clock, User } from "lucide-react";
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

export default function ExpenseTimeline({ expenses, people, isLoading }) {
  const [expandedExpenses, setExpandedExpenses] = useState({});
  
  const getPerson = (personId) => people.find(p => p.id === personId);

  const toggleExpenseDetails = (expenseId) => {
    setExpandedExpenses(prev => ({
      ...prev,
      [expenseId]: !prev[expenseId]
    }));
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

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.expense_date || expense.created_date;
    const dateKey = format(parseISO(date), 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array(3).fill(0).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array(2).fill(0).map((_, j) => (
                <Card key={j} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-600">Try adjusting your filters or add some expenses</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const dateExpenses = groupedExpenses[dateKey];
        const totalForDate = dateExpenses.reduce((sum, exp) => sum + exp.total_amount, 0);
        
        return (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}
              </h2>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ₹{totalForDate.toFixed(2)} total
              </Badge>
            </div>
            
            <div className="space-y-4">
              {dateExpenses.map((expense, index) => {
                const paidBy = getPerson(expense.paid_by);
                const isExpanded = expandedExpenses[expense.id];
                const settledCount = expense.participants?.filter(p => p.is_settled).length || 0;
                const totalParticipants = expense.participants?.length || 0;
                
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                            style={{ backgroundColor: paidBy?.avatar_color || '#10B981' }}
                          >
                            {paidBy?.name?.charAt(0) || '?'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {expense.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  Paid by {paidBy?.name || 'Unknown'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xl text-gray-900">
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
                            
                            {expense.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {expense.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{totalParticipants} people</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>₹{(expense.total_amount / totalParticipants).toFixed(2)} each</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {settledCount === totalParticipants ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-orange-500" />
                                  )}
                                  <span className={settledCount === totalParticipants ? 'text-green-600' : 'text-orange-600'}>
                                    {settledCount}/{totalParticipants} settled
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpenseDetails(expense.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Show Details
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <h4 className="font-semibold text-gray-900 mb-4">Payment Breakdown:</h4>
                              <div className="space-y-3">
                                {expense.participants?.map((participant) => {
                                  const person = getPerson(participant.person_id);
                                  const isPayer = participant.person_id === expense.paid_by;
                                  
                                  return (
                                    <div key={participant.person_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3 flex-1">
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
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {person?.name || 'Unknown'}
                                            {isPayer && (
                                              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                Paid
                                              </Badge>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Owes ₹{participant.amount_owed.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
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
                                              Settled
                                            </>
                                          ) : (
                                            <>
                                              <Clock className="w-3 h-3 mr-1" />
                                              Pending
                                            </>
                                          )}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}