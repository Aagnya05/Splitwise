import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, X, Check } from "lucide-react";

const avatarColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
];

export default function AddPersonForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_color: avatarColors[Math.floor(Math.random() * avatarColors.length)]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5 text-green-600" />
          Add New Person
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg"
              style={{ backgroundColor: formData.avatar_color }}
            >
              {formData.name.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('avatar_color', color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    formData.avatar_color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter full name"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-medium">Phone (optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-11"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}