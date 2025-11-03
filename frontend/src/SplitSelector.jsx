// src/SplitSelector.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card.jsx";

import { Button } from "./components/ui/button.jsx";
import { Input } from "./components/ui/input.jsx";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs.jsx";

import {
  DollarSign,
  Users,
  Calculator,
  Check,
} from "lucide-react";

import { motion } from "framer-motion";

// Props this component expects:
// totalAmount: number
// participants: [{ person_id, amount_owed, is_settled }, ...]
// people: [{ id, name, avatar_color, email... }, ...]
// onComplete: function(finalParticipantsArray)
// isLoading: boolean
export default function SplitSelector({
  totalAmount = 0,
  participants = [],
  people = [],
  onComplete,
  isLoading = false,
}) {
  const [splitType, setSplitType] = useState("equal"); // "equal" | "custom"
  const [customAmounts, setCustomAmounts] = useState({});

  // per-person share if equal split
  const perHead =
    participants.length > 0 ? totalAmount / participants.length : 0;

  // initialize customAmounts when participants or total changes
  useEffect(() => {
    if (participants.length === 0) {
      setCustomAmounts({});
      return;
    }

    const next = {};
    const each = perHead;
    participants.forEach((p) => {
      next[p.person_id] = each.toFixed(2);
    });
    setCustomAmounts(next);
  }, [totalAmount, participants, perHead]);

  // helper: get full person data from a person_id
  function getPerson(personId) {
    return people.find((p) => p.id === personId);
  }

  // handle typing a custom amount
  function handleCustomAmountChange(personId, amount) {
    setCustomAmounts((prev) => ({
      ...prev,
      [personId]: amount,
    }));
  }

  // calculate sum of all custom amounts
  function getTotalCustom() {
    return Object.values(customAmounts).reduce((sum, rawVal) => {
      const num = parseFloat(rawVal || 0);
      if (isNaN(num)) return sum;
      return sum + num;
    }, 0);
  }

  // are we valid? (either equal split OR custom adds up == totalAmount)
  const totalCustom = getTotalCustom();
  const isValidSplit =
    splitType === "equal" ||
    Math.abs(totalCustom - totalAmount) < 0.01;

  // finalize split and send up
  function handleConfirm() {
    const finalParticipants = participants.map((p) => {
      const owed =
        splitType === "equal"
          ? perHead
          : parseFloat(customAmounts[p.person_id] || 0);

      return {
        ...p,
        amount_owed: Number.isNaN(owed) ? 0 : owed,
      };
    });

    if (onComplete) {
      onComplete(finalParticipants);
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm p-6">
        <div className="text-gray-600 text-sm">Calculating split...</div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Calculator className="w-6 h-6 text-green-600" />
          <span>
            How to split ₹
            {Number.isFinite(totalAmount)
              ? totalAmount.toFixed(2)
              : String(totalAmount)}
            ?
          </span>
        </CardTitle>

        <p className="text-gray-600">
          Choose how to divide the expense
        </p>
      </CardHeader>

      <CardContent>
        {/* Tabs wrapper */}
        <Tabs
          value={splitType}
          onValueChange={setSplitType}
          className="space-y-6"
        >
          {/* tab buttons row */}
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="equal" className="rounded-lg">
              Equal Split
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-lg">
              Custom Amounts
            </TabsTrigger>
          </TabsList>

          {/* EQUAL SPLIT TAB */}
          <TabsContent value="equal" className="space-y-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="text-center mb-4">
                <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Equal Split
                </h3>
                <p className="text-gray-600">
                  Everyone pays the same amount
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600">
                  ₹{perHead.toFixed(2)}
                </div>
                <div className="text-gray-500 text-sm">per person</div>
              </div>

              <div className="space-y-3">
                {participants.map((participant) => {
                  const person = getPerson(participant.person_id);
                  if (!person) return null;

                  return (
                    <motion.div
                      key={participant.person_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{
                            backgroundColor:
                              person.avatar_color || "#4f46e5",
                          }}
                        >
                          {person.name
                            ? person.name.charAt(0).toUpperCase()
                            : "?"}
                        </div>

                        <span className="font-medium text-gray-900">
                          {person.name || "Unknown"}
                        </span>
                      </div>

                      <span className="font-semibold text-green-600">
                        ₹{perHead.toFixed(2)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* CUSTOM SPLIT TAB */}
          <TabsContent value="custom" className="space-y-6">
            <div className="space-y-4">
              {/* total summary */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-medium text-gray-900">
                  Total to split:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ₹
                  {Number.isFinite(totalAmount)
                    ? totalAmount.toFixed(2)
                    : String(totalAmount)}
                </span>
              </div>

              {/* per-person inputs */}
              <div className="space-y-3">
                {participants.map((participant) => {
                  const person = getPerson(participant.person_id);
                  if (!person) return null;

                  const value =
                    customAmounts[participant.person_id] || "";

                  return (
                    <motion.div
                      key={participant.person_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border"
                    >
                      {/* avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{
                          backgroundColor:
                            person.avatar_color || "#4f46e5",
                        }}
                      >
                        {person.name
                          ? person.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>

                      {/* name */}
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {person.name || "Unknown"}
                        </span>
                      </div>

                      {/* input for owed amount */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">₹</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={totalAmount}
                          value={value}
                          onChange={(e) =>
                            handleCustomAmountChange(
                              participant.person_id,
                              e.target.value
                            )
                          }
                          className="w-24 text-right"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* validation summary */}
              <div
                className={
                  "p-4 rounded-xl border " +
                  (isValidSplit
                    ? "bg-green-50 border-green-100"
                    : "bg-red-50 border-red-100")
                }
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Total entered:
                  </span>
                  <span
                    className={
                      "font-bold " +
                      (isValidSplit
                        ? "text-green-600"
                        : "text-red-600")
                    }
                  >
                    ₹{totalCustom.toFixed(2)}
                  </span>
                </div>

                {!isValidSplit && (
                  <p className="text-sm text-red-600 mt-1">
                    Difference: ₹
                    {Math.abs(totalCustom - totalAmount).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* footer row: people count + confirm button */}
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>
              {participants.length}{" "}
              {participants.length === 1 ? "person" : "people"}{" "}
              splitting this expense
            </span>
          </div>

          <Button
            className={
              "flex items-center justify-center gap-2 " +
              (isValidSplit
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed hover:bg-gray-400")
            }
            disabled={!isValidSplit}
            onClick={handleConfirm}
          >
            <Check className="w-4 h-4" />
            <span>Confirm Split</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
