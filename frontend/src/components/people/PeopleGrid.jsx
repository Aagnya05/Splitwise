// src/components/people/PeopleGrid.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Mail, Phone, Trash2 } from "lucide-react";

export default function PeopleGrid({ people = [], isLoading, onDelete }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!people.length) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 text-lg font-semibold">
            People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600 text-sm">
            No people yet. Add someone to start splitting.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <Card
          key={person.id}
          className="border border-gray-200 bg-white shadow-sm flex flex-col"
        >
          <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-gray-100">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{
                backgroundColor: person.avatar_color || "#4f46e5",
              }}
            >
              {person.name ? person.name.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-gray-900">
                {person.name || "Unknown"}
              </CardTitle>
              <div className="text-xs text-gray-500 break-all flex items-center gap-1">
                {person.email ? (
                  <>
                    <Mail className="w-3 h-3" />
                    <span>{person.email}</span>
                  </>
                ) : (
                  <span className="text-gray-400">no email</span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col justify-between py-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{person.phone || "—"}</span>
              </div>
              <div className="text-xs text-gray-400">
                ID: <span className="font-mono">{person.id}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (onDelete) onDelete(person.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
