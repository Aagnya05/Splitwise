import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, gradient, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <Icon className={`w-6 h-6 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
            </div>
          </div>
          {trend && (
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-gray-600">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}