// src/services/analyticsService.js

/**
 * Analytics Service for Algolyze
 * Wraps Google Analytics 4 gtag calls
 */

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// Check if gtag is available
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Check if analytics is enabled (has measurement ID)
const isAnalyticsEnabled = () => {
  return !!GA_MEASUREMENT_ID;
};

/**
 * Initialize Google Analytics (call this in your App.js or index.js)
 */
export const initGA = () => {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] No GA_MEASUREMENT_ID found, analytics disabled');
    return;
  }

  // Add gtag script dynamically
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  console.log(`[Analytics] Initialized with ID: ${GA_MEASUREMENT_ID}`);
};

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (!isGtagAvailable()) {
    console.log('[Analytics] gtag not available, skipping:', eventName, params);
    return;
  }
  
  try {
    window.gtag('event', eventName, params);
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
};

/**
 * Track feature usage
 * @param {string} feature - Feature name (export, clone, compare, etc.)
 * @param {object} details - Additional details
 */
export const trackFeatureUsed = (feature, details = {}) => {
  trackEvent('feature_used', {
    feature_name: feature,
    ...details
  });
};

// ============================================
// FEATURE-SPECIFIC TRACKING FUNCTIONS
// ============================================

/**
 * Track CSV export
 */
export const trackExportCSV = (indexName, recordCount, exportMode = 'byID') => {
  trackEvent('export_csv', {
    index_name: indexName,
    records_count: recordCount,
    export_mode: exportMode
  });
};

/**
 * Track index clone
 */
export const trackCloneIndex = (sourceIndex, targetIndex, options = {}) => {
  trackEvent('clone_index', {
    source_index: sourceIndex,
    target_index: targetIndex,
    clone_objects: options.objects || false,
    clone_settings: options.settings || false,
    clone_rules: options.rules || false,
    clone_synonyms: options.synonyms || false,
    different_app: options.differentApp || false
  });
};

/**
 * Track index comparison
 */
export const trackCompareIndexes = (indexCount, comparisonType) => {
  trackEvent('compare_indexes', {
    index_count: indexCount,
    comparison_type: comparisonType // 'searchableAttributes', 'facets', 'rules'
  });
};

/**
 * Track bulk update
 */
export const trackBulkUpdate = (indexCount, recordCount, updateMode = 'byID') => {
  trackEvent('bulk_update', {
    index_count: indexCount,
    records_count: recordCount,
    update_mode: updateMode
  });
};

/**
 * Track object deletion
 */
export const trackDeleteObjects = (indexCount, objectCount, deleteMode = 'byID') => {
  trackEvent('delete_objects', {
    index_count: indexCount,
    objects_count: objectCount,
    delete_mode: deleteMode
  });
};

/**
 * Track data copy between indexes
 */
export const trackCopyData = (sourceIndex, targetCount, recordCount, differentApp = false) => {
  trackEvent('copy_data', {
    source_index: sourceIndex,
    target_count: targetCount,
    records_count: recordCount,
    different_app: differentApp
  });
};

/**
 * Track analytics fetch (no results searches)
 */
export const trackAnalyticsFetch = (indexName, resultCount, period) => {
  trackEvent('analytics_fetch', {
    index_name: indexName,
    results_count: resultCount,
    period_days: period
  });
};

/**
 * Track recommend tester usage
 */
export const trackRecommendTest = (indexName, model, resultCount) => {
  trackEvent('recommend_test', {
    index_name: indexName,
    model: model,
    results_count: resultCount
  });
};

/**
 * Track fake events generation
 */
export const trackGenerateFakeEvents = (eventCount) => {
  trackEvent('generate_fake_events', {
    events_count: eventCount
  });
};

/**
 * Track query decoder usage
 */
export const trackQueryDecoder = () => {
  trackEvent('query_decoder_used');
};

// ============================================
// ERROR TRACKING
// ============================================

/**
 * Track an error
 * @param {string} feature - Feature where error occurred
 * @param {string} errorMessage - Error message
 * @param {string} errorType - Type of error (api_error, validation_error, etc.)
 */
export const trackError = (feature, errorMessage, errorType = 'unknown') => {
  trackEvent('error_occurred', {
    feature_name: feature,
    error_message: errorMessage.substring(0, 100), // Limit length
    error_type: errorType
  });
};

const analyticsService = {
  trackEvent,
  trackFeatureUsed,
  trackExportCSV,
  trackCloneIndex,
  trackCompareIndexes,
  trackBulkUpdate,
  trackDeleteObjects,
  trackCopyData,
  trackAnalyticsFetch,
  trackRecommendTest,
  trackGenerateFakeEvents,
  trackQueryDecoder,
  trackError
};

export default analyticsService;