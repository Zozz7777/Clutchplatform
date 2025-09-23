# PowerShell script to fix all remaining t() calls
$files = @(
    "clutch-admin/src/components/widgets/customer-health-score.tsx",
    "clutch-admin/src/components/widgets/csat-nps-trends.tsx",
    "clutch-admin/src/components/widgets/incident-cost.tsx",
    "clutch-admin/src/components/widgets/project-roi.tsx",
    "clutch-admin/src/components/widgets/churn-attribution.tsx",
    "clutch-admin/src/components/widgets/engagement-heatmap.tsx",
    "clutch-admin/src/components/widgets/sla-compliance.tsx",
    "clutch-admin/src/components/widgets/onboarding-completion.tsx",
    "clutch-admin/src/components/widgets/churn-risk-card.tsx",
    "clutch-admin/src/components/widgets/compliance-radar.tsx",
    "clutch-admin/src/components/widgets/top-enterprise-clients.tsx",
    "clutch-admin/src/components/widgets/revenue-margin-card.tsx"
)

# Common replacements
$replacements = @{
    "{t('common.unableToLoad')}" = "Unable to load data"
    "{t('common.loading')}" = "Loading..."
    "{t('common.error')}" = "Error"
    "{t('common.success')}" = "Success"
    "{t('common.cancel')}" = "Cancel"
    "{t('common.save')}" = "Save"
    "{t('common.delete')}" = "Delete"
    "{t('common.edit')}" = "Edit"
    "{t('common.add')}" = "Add"
    "{t('common.view')}" = "View"
    "{t('common.export')}" = "Export"
    "{t('common.import')}" = "Import"
    "{t('common.refresh')}" = "Refresh"
    "{t('common.search')}" = "Search"
    "{t('common.filter')}" = "Filter"
    "{t('common.sort')}" = "Sort"
    "{t('common.download')}" = "Download"
    "{t('common.upload')}" = "Upload"
    "{t('common.close')}" = "Close"
    "{t('common.open')}" = "Open"
    "{t('common.yes')}" = "Yes"
    "{t('common.no')}" = "No"
    "{t('common.ok')}" = "OK"
    "{t('common.back')}" = "Back"
    "{t('common.next')}" = "Next"
    "{t('common.previous')}" = "Previous"
    "{t('common.finish')}" = "Finish"
    "{t('common.start')}" = "Start"
    "{t('common.stop')}" = "Stop"
    "{t('common.pause')}" = "Pause"
    "{t('common.resume')}" = "Resume"
    "{t('common.retry')}" = "Retry"
    "{t('common.reset')}" = "Reset"
    "{t('common.clear')}" = "Clear"
    "{t('common.select')}" = "Select"
    "{t('common.selectAll')}" = "Select All"
    "{t('common.deselectAll')}" = "Deselect All"
    "{t('common.none')}" = "None"
    "{t('common.all')}" = "All"
    "{t('common.some')}" = "Some"
    "{t('common.many')}" = "Many"
    "{t('common.few')}" = "Few"
    "{t('common.more')}" = "More"
    "{t('common.less')}" = "Less"
    "{t('common.most')}" = "Most"
    "{t('common.least')}" = "Least"
    "{t('common.best')}" = "Best"
    "{t('common.worst')}" = "Worst"
    "{t('common.better')}" = "Better"
    "{t('common.worse')}" = "Worse"
    "{t('common.good')}" = "Good"
    "{t('common.bad')}" = "Bad"
    "{t('common.great')}" = "Great"
    "{t('common.excellent')}" = "Excellent"
    "{t('common.poor')}" = "Poor"
    "{t('common.fair')}" = "Fair"
    "{t('common.average')}" = "Average"
    "{t('common.above')}" = "Above"
    "{t('common.below')}" = "Below"
    "{t('common.high')}" = "High"
    "{t('common.low')}" = "Low"
    "{t('common.medium')}" = "Medium"
    "{t('common.small')}" = "Small"
    "{t('common.large')}" = "Large"
    "{t('common.big')}" = "Big"
    "{t('common.tiny')}" = "Tiny"
    "{t('common.huge')}" = "Huge"
    "{t('common.massive')}" = "Massive"
    "{t('common.mini')}" = "Mini"
    "{t('common.micro')}" = "Micro"
    "{t('common.macro')}" = "Macro"
    "{t('common.mega')}" = "Mega"
    "{t('common.giga')}" = "Giga"
    "{t('common.tera')}" = "Tera"
    "{t('common.peta')}" = "Peta"
    "{t('common.exa')}" = "Exa"
    "{t('common.zetta')}" = "Zetta"
    "{t('common.yotta')}" = "Yotta"
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file"
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        foreach ($pattern in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($pattern), $replacements[$pattern]
        }
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "Updated $file"
        }
    }
}

Write-Host "Done!"
