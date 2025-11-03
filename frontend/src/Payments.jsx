
import React, { useState, useEffect } from "react";
import { PersonAPI as Person, ExpenseAPI as Expense } from "./apiClient";
// or "./apiClient" depending on where the file is
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Copy,
  Check,
  Download,
  User
} from "lucide-react";

export default function Payments() {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setIsLoading(true);
    const data = await Person.list();
    setPeople(data);
    if (data.length > 0) {
      setSelectedPerson(data[0]);
    }
    setIsLoading(false);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateQRCode = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Options</h1>
            <p className="text-lg text-gray-600">View QR codes and payment details</p>
          </div>
        </motion.div>

        {people.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No people added yet</h3>
            <p className="text-gray-600">Add people first to set up payment options</p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* People List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Select Person
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {people.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        selectedPerson?.id === person.id
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 shadow-sm'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: person.avatar_color }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{person.name}</p>
                        {person.email && (
                          <p className="text-xs text-gray-500 truncate">{person.email}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Details */}
            {selectedPerson && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: selectedPerson.avatar_color }}
                      >
                        {selectedPerson.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle>{selectedPerson.name}</CardTitle>
                        <p className="text-sm text-gray-500">Payment Information</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="upi" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
                        <TabsTrigger value="upi" className="rounded-lg">
                          <Smartphone className="w-4 h-4 mr-2" />
                          UPI
                        </TabsTrigger>
                        <TabsTrigger value="bank" className="rounded-lg">
                          <Building2 className="w-4 h-4 mr-2" />
                          Bank
                        </TabsTrigger>
                        <TabsTrigger value="card" className="rounded-lg">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Card
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upi" className="space-y-6">
                        <div className="text-center space-y-4">
                          <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 inline-block">
                            <img
                              src={generateQRCode(`upi://pay?pa=${selectedPerson.email || 'example@upi'}&pn=${selectedPerson.name}&cu=INR`)}
                              alt="UPI QR Code"
                              className="w-64 h-64 mx-auto"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-2">UPI ID</p>
                            <div className="flex items-center gap-2 justify-center">
                              <Badge variant="outline" className="text-base px-4 py-2">
                                {selectedPerson.email || selectedPerson.phone || 'Not set'}@upi
                              </Badge>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(`${selectedPerson.email || selectedPerson.phone}@upi`, 'upi')}
                              >
                                {copiedField === 'upi' ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 max-w-md mx-auto">
                            Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.) to pay {selectedPerson.name}
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="bank" className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Bank Account Details
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{selectedPerson.name}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(selectedPerson.name, 'name')}
                                >
                                  {copiedField === 'name' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Account Number</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">XXXX XXXX 1234</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy('XXXXXXXXXXXX1234', 'account')}
                                >
                                  {copiedField === 'account' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">XXXX0001234</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy('XXXX0001234', 'ifsc')}
                                >
                                  {copiedField === 'ifsc' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-4">
                            ⚠️ This is sample data. Update contact details to show real information.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="card" className="space-y-4">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Credit/Debit Card Details
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Card Holder Name</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{selectedPerson.name}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(selectedPerson.name, 'cardname')}
                                >
                                  {copiedField === 'cardname' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Card Number</p>
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">XXXX XXXX XXXX 1234</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy('XXXX XXXX XXXX 1234', 'cardnumber')}
                                >
                                  {copiedField === 'cardnumber' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900">MM/YY</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopy('MM/YY', 'expiry')}
                                  >
                                    {copiedField === 'expiry' ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">CVV</p>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900">XXX</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopy('XXX', 'cvv')}
                                  >
                                    {copiedField === 'cvv' ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-4">
                            ⚠️ This is sample data. Update contact details to show real information.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
