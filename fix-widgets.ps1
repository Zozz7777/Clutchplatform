# Script to fix all widgets missing useTranslations import

$widgets = @(
    "adoption-funnel.tsx",
    "arpu-arppu.tsx", 
    "at-risk-clients.tsx",
    "audit-trail-insights.tsx",
    "cash-flow-projection.tsx",
    "churn-adjusted-forecast.tsx",
    "churn-attribution.tsx",
    "client-growth-contribution.tsx",
    "customer-lifetime-value.tsx",
    "engagement-heatmap.tsx",
    "feature-usage.tsx",
    "forecast-accuracy-trend.tsx",
    "forecast-accuracy.tsx",
    "fraud-impact.tsx",
    "fuel-cost-metrics.tsx",
    "maintenance-forecast.tsx",
    "model-drift-detector.tsx",
    "overdue-invoices.tsx",
    "rbac-overview.tsx",
    "recommendation-uplift.tsx",
    "report-usage-stats.tsx",
    "revenue-expenses.tsx",
    "risk-scenario-matrix.tsx",
    "root-cause-timeline.tsx",
    "security-alerts.tsx",
    "sla-compliance.tsx",
    "training-roi.tsx",
    "upsell-opportunities.tsx"
)

foreach ($widget in $widgets) {
    $filePath = "clutch-admin/src/components/widgets/$widget"
    Write-Host "Fixing $widget..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Add useTranslations import after the first import block
    if ($content -match "(import.*from 'lucide-react';)") {
        $content = $content -replace "(import.*from 'lucide-react';)", "`$1`nimport { useTranslations } from '@/hooks/use-translations';"
    }
    
    # Add const { t } = useTranslations(); after the function declaration
    if ($content -match "(export function \w+\(\{.*?\}: \w+Props\) \{)") {
        $content = $content -replace "(export function \w+\(\{.*?\}: \w+Props\) \{)", "`$1`n  const { t } = useTranslations();"
    }
    
    # Write the modified content back
    Set-Content $filePath $content -NoNewline
}

Write-Host "All widgets fixed!"
