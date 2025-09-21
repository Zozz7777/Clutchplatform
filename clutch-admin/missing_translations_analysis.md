# Missing Translations Analysis

## Translation Keys Found in Codebase

Based on the grep search, here are the translation keys being used in the codebase:

### Chat Page (`chat.*`)
- `chat.failedToLoadChatData`
- `chat.failedToSendMessage`
- `chat.title`
- `chat.description`
- `chat.online`
- `chat.offline`
- `chat.you`

### Dashboard/CMS Page (`dashboard.*`)
- `dashboard.newChat`
- `dashboard.conversations`
- `dashboard.typeAMessage`
- `dashboard.loadingCmsData`
- `dashboard.contentManagementSystem`
- `dashboard.manageWebsiteContent`
- `dashboard.newContent`
- `dashboard.uploadMedia`
- `dashboard.totalContent`
- `dashboard.published`
- `dashboard.mediaFiles`
- `dashboard.images`
- `dashboard.categories`
- `dashboard.contentCategories`
- `dashboard.totalViews`
- `dashboard.allTimeViews`
- `dashboard.content`
- `dashboard.media`
- `dashboard.contentManagement`
- `dashboard.managePagesPosts`
- `dashboard.searchContent`
- `dashboard.allStatus`
- `dashboard.draft`
- `dashboard.scheduled`
- `dashboard.archived`
- `dashboard.allTypes`
- `dashboard.pages`
- `dashboard.posts`
- `dashboard.articles`
- `dashboard.helpDocs`
- `dashboard.by`
- `dashboard.views`
- `dashboard.created`
- `dashboard.updated`
- `dashboard.actions`
- `dashboard.viewContent`
- `dashboard.editContent`
- `dashboard.duplicate`
- `dashboard.publish`
- `dashboard.unpublish`
- `dashboard.archive`
- `dashboard.noContentFound`
- `dashboard.mediaLibrary`
- `dashboard.manageImagesVideos`
- `dashboard.uploaded`
- `dashboard.uses`
- `dashboard.view`
- `dashboard.download`
- `dashboard.editDetails`
- `dashboard.copyUrl`
- `dashboard.organizeContentWithCategories`
- `dashboard.items`
- `dashboard.subcategories`
- `dashboard.slug`
- `dashboard.editCategory`
- `dashboard.addSubcategory`
- `dashboard.deleteCategory`
- `dashboard.noCategoriesFound`
- `dashboard.assetManagement`
- `dashboard.trackAndManageAssets`
- `dashboard.addAsset`
- `dashboard.totalValue`
- `dashboard.currentMarketValue`
- `dashboard.all`
- `dashboard.active`
- `dashboard.inactive`
- `dashboard.maintenance`
- `dashboard.retired`
- `dashboard.currentValue`
- `dashboard.location`
- `dashboard.purchaseDate`
- `dashboard.currentValueEgp`

### Assets Page (`assets.*`)
- `assets.currentUser`
- `assets.selectedEmployee`
- `assets.totalAssets`
- `assets.active`
- `assets.inactive`
- `assets.maintenanceDue`
- `assets.next30Days`
- `assets.assignedAssets`
- `assets.title`
- `assets.description`
- `assets.unassigned`
- `assets.searchAssets`
- `assets.filterByType`

### Downtime Widget (`downtime.*`)
- `downtime.other`
- `downtime.downtimeImpact`
- `downtime.lostRevenueHoursDescription`
- `downtime.lostRevenueHours`
- `downtime.topAffectedVehicles`
- `downtime.exportReport`
- `downtime.downtimeInsights`
- `downtime.totalDowntimeHours`
- `downtime.hours`
- `downtime.revenueImpactingDowntime`
- `downtime.totalRevenueImpact`
- `downtime.averageDowntimePerVehicle`
- `downtime.topDowntimeReason`
- `downtime.revenueImpactAboveTarget`

### Common (`common.*`)
- `common.unableToLoad`

## Currently Available in useTranslations Hook

The current fallback translations include:
- `common.*` (basic actions)
- `navigation.*` (navigation items)
- `sidebar.*` (sidebar elements)
- `header.*` (header elements)
- `language.*` (language options)
- `hr.*` (HR specific)
- `auth.*` (authentication)
- `dashboard.*` (basic dashboard items)

## Missing Translation Keys

Based on the analysis, the following translation keys are missing from our current fallback translations:

### Missing Chat Translations
- `chat.failedToLoadChatData`
- `chat.failedToSendMessage`
- `chat.title`
- `chat.description`
- `chat.online`
- `chat.offline`
- `chat.you`

### Missing Dashboard/CMS Translations
- `dashboard.newChat`
- `dashboard.conversations`
- `dashboard.typeAMessage`
- `dashboard.loadingCmsData`
- `dashboard.contentManagementSystem`
- `dashboard.manageWebsiteContent`
- `dashboard.newContent`
- `dashboard.uploadMedia`
- `dashboard.totalContent`
- `dashboard.published`
- `dashboard.mediaFiles`
- `dashboard.images`
- `dashboard.categories`
- `dashboard.contentCategories`
- `dashboard.totalViews`
- `dashboard.allTimeViews`
- `dashboard.content`
- `dashboard.media`
- `dashboard.contentManagement`
- `dashboard.managePagesPosts`
- `dashboard.searchContent`
- `dashboard.allStatus`
- `dashboard.draft`
- `dashboard.scheduled`
- `dashboard.archived`
- `dashboard.allTypes`
- `dashboard.pages`
- `dashboard.posts`
- `dashboard.articles`
- `dashboard.helpDocs`
- `dashboard.by`
- `dashboard.views`
- `dashboard.created`
- `dashboard.updated`
- `dashboard.actions`
- `dashboard.viewContent`
- `dashboard.editContent`
- `dashboard.duplicate`
- `dashboard.publish`
- `dashboard.unpublish`
- `dashboard.archive`
- `dashboard.noContentFound`
- `dashboard.mediaLibrary`
- `dashboard.manageImagesVideos`
- `dashboard.uploaded`
- `dashboard.uses`
- `dashboard.view`
- `dashboard.download`
- `dashboard.editDetails`
- `dashboard.copyUrl`
- `dashboard.organizeContentWithCategories`
- `dashboard.items`
- `dashboard.subcategories`
- `dashboard.slug`
- `dashboard.editCategory`
- `dashboard.addSubcategory`
- `dashboard.deleteCategory`
- `dashboard.noCategoriesFound`
- `dashboard.assetManagement`
- `dashboard.trackAndManageAssets`
- `dashboard.addAsset`
- `dashboard.totalValue`
- `dashboard.currentMarketValue`
- `dashboard.all`
- `dashboard.active`
- `dashboard.inactive`
- `dashboard.maintenance`
- `dashboard.retired`
- `dashboard.currentValue`
- `dashboard.location`
- `dashboard.purchaseDate`
- `dashboard.currentValueEgp`

### Missing Assets Translations
- `assets.currentUser`
- `assets.selectedEmployee`
- `assets.totalAssets`
- `assets.active`
- `assets.inactive`
- `assets.maintenanceDue`
- `assets.next30Days`
- `assets.assignedAssets`
- `assets.title`
- `assets.description`
- `assets.unassigned`
- `assets.searchAssets`
- `assets.filterByType`

### Missing Downtime Widget Translations
- `downtime.other`
- `downtime.downtimeImpact`
- `downtime.lostRevenueHoursDescription`
- `downtime.lostRevenueHours`
- `downtime.topAffectedVehicles`
- `downtime.exportReport`
- `downtime.downtimeInsights`
- `downtime.totalDowntimeHours`
- `downtime.hours`
- `downtime.revenueImpactingDowntime`
- `downtime.totalRevenueImpact`
- `downtime.averageDowntimePerVehicle`
- `downtime.topDowntimeReason`
- `downtime.revenueImpactAboveTarget`

## Recommendation

Add these missing translation keys to the `fallbackTranslations` object in `clutch-admin/src/hooks/use-translations.ts` to ensure all UI elements display proper text instead of translation keys.
