#!/bin/bash

# Script to update ziad@yourclutch.com with all necessary roles
# Run this after the backend is deployed with the new auth endpoint

BACKEND_URL="https://clutch-main-nk7x.onrender.com"

echo "🚀 Updating user roles for ziad@yourclutch.com..."

# All the roles needed based on the requireRole checks in the codebase
ALL_ROLES='[
  "admin",
  "hr_manager",
  "fleet_manager", 
  "enterprise_manager",
  "sales_manager",
  "analytics",
  "management",
  "cto",
  "operations",
  "sales_rep",
  "manager",
  "analyst",
  "super_admin",
  "finance_manager",
  "marketing_manager",
  "legal_manager",
  "partner_manager",
  "hr",
  "fleet_admin",
  "driver",
  "accountant"
]'

# Try with ziad@yourclutch.com
echo "📧 Trying ziad@yourclutch.com..."
curl -X PUT "${BACKEND_URL}/api/v1/auth/update-user-roles" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"ziad@yourclutch.com\",
    \"roles\": ${ALL_ROLES}
  }"

echo -e "\n\n"

# Try with ziad@clutchapp.one
echo "📧 Trying ziad@clutchapp.one..."
curl -X PUT "${BACKEND_URL}/api/v1/auth/update-user-roles" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"ziad@clutchapp.one\",
    \"roles\": ${ALL_ROLES}
  }"

echo -e "\n\n✅ Script completed!"
echo "📧 Email: ziad@yourclutch.com"
echo "🔑 Password: 4955698*Z*z"
