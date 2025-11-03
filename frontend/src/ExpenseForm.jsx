
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, ArrowRight } from "lucide-react";

const categories = [
  { value: "food", label: "Food & Drinks", emoji: "🍽️" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "accommodation", label: "Accommodation", emoji: "🏠" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛒" },
  { value: "utilities", label: "Utilities", emoji: "⚡" },
  { value: "other", label: "Other", emoji: "📝" }
];

export default function ExpenseForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.total_amount) return;
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Receipt className="w-6 h-6 text-green-600" />
          Expense Details
        </CardTitle>
        <p className="text-gray-600">Tell us about the expense</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">What was this expense for? *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              className="h-12 text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add any additional details..."
              className="h-20 resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium">Total Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => handleChange('total_amount', e.target.value)}
                placeholder="0.00"
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="font-medium">Expense Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => handleChange('expense_date', e.target.value)}
              className="h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!formData.title || !formData.total_amount}
          >
            Next: Select People
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
