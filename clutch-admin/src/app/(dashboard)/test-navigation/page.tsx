"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestNavigationPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Test Page</CardTitle>
          <CardDescription>
            This page is used to test if navigation is working properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-600">✅ Navigation is working!</p>
            <p className="text-sm text-muted-foreground">
              If you can see this page, the navigation system is functioning correctly.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Page loaded successfully</li>
                <li>✅ No import errors</li>
                <li>✅ No runtime errors</li>
                <li>✅ Navigation working</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
