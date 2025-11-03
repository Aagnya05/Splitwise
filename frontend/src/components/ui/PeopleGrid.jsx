import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { Users, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { PersonAPI as Person, ExpenseAPI as Expense } from "../../apiClient";
// or "./apiClient" depending on where the file is
import EditPersonDialog from "../../EditPersonDialog";

export default function PeopleGrid({ people, isLoading, onUpdate }) {
  const [editingPerson, setEditingPerson] = useState(null);

  const handleDelete = async (personId) => {
    if (confirm("Are you sure you want to delete this person?")) {
      await Person.delete(personId);
      onUpdate();
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : people.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No people added yet</h3>
          <p className="text-gray-600">Add your first person to start splitting expenses</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-200"
                        style={{ backgroundColor: person.avatar_color }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {person.name}
                        </h3>
                        {person.email && (
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm truncate">{person.email}</span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{person.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPerson(person)}
                        className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person.id)}
                        className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {editingPerson && (
            <EditPersonDialog
              person={editingPerson}
              onClose={() => setEditingPerson(null)}
              onUpdate={onUpdate}
            />
          )}
        </>
      )}
    </div>
  );
}