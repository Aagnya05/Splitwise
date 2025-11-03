import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonSelector({ people, onSelect, selectedPeople, paidBy }) {
  const [selected, setSelected] = useState(selectedPeople || []);
  const [whosPaying, setWhosPaying] = useState(paidBy || '');

  const togglePerson = (personId) => {
    setSelected(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0 && whosPaying) {
      onSelect(selected, whosPaying);
    }
  };

  const getPerson = (personId) => people.find(p => p.id === personId);

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          Who was involved?
        </CardTitle>
        <p className="text-gray-600">Select people and who paid</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* People Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Select People
          </h3>
          {people.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No people added yet</p>
              <p className="text-gray-400 text-sm">Go to People page to add someone first</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {people.map((person) => (
                <motion.div
                  key={person.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    onClick={() => togglePerson(person.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selected.includes(person.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: person.avatar_color }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{person.name}</p>
                        {person.email && (
                          <p className="text-sm text-gray-500">{person.email}</p>
                        )}
                      </div>
                      {selected.includes(person.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Who Paid */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-gray-900">Who paid upfront?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.map((personId) => {
                const person = getPerson(personId);
                if (!person) return null;
                
                return (
                  <motion.div
                    key={personId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      onClick={() => setWhosPaying(personId)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        whosPaying === personId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: person.avatar_color }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{person.name}</p>
                        </div>
                        {whosPaying === personId && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 p-4 rounded-xl"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map((personId) => {
                const person = getPerson(personId);
                return person ? (
                  <Badge key={personId} variant="secondary" className="bg-green-100 text-green-800">
                    {person.name}
                  </Badge>
                ) : null;
              })}
            </div>
            <p className="text-sm text-gray-600">
              {selected.length} people selected
              {whosPaying && ` • ${getPerson(whosPaying)?.name} paid upfront`}
            </p>
          </motion.div>
        )}

        <Button
          onClick={handleContinue}
          disabled={selected.length === 0 || !whosPaying}
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Next: Split Amount
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}