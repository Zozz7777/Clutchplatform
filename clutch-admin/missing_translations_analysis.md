# Missing Translations Analysis

## Translation Keys Being Used in Components

Based on the grep analysis, here are the translation keys that are being used in the codebase but may be missing from our fallback translations:

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
- `dashboard.delete`
- `dashboard.noMediaFilesFound`
- `dashboard.organizeContentWithCategories`
- `dashboard.items`
- `dashboard.subcategories`
- `dashboard.slug`
- `dashboard.editCategory`
- `dashboard.addSubcategory`
- `dashboard.deleteCategory`
- `dashboard.noCategoriesFound`

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
- `dashboard.purchaseDate`
- `dashboard.currentValueEgp`

### Downtime Impact Widget (`downtime.*`)
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

## Missing Translation Keys

The following keys are being used in the codebase but are NOT present in our current fallback translations:

### Critical Missing Keys:
1. **Chat Section**: All `chat.*` keys
2. **Extended Dashboard Section**: Most `dashboard.*` keys beyond basic ones
3. **Assets Section**: All `assets.*` keys
4. **Downtime Section**: All `downtime.*` keys

## Recommendation

We need to add these missing translation keys to our `useTranslations` hook fallback translations to ensure all components display proper text instead of translation keys.