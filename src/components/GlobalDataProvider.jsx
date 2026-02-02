// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { base44 } from '@/api/base44Client';

// const GlobalDataContext = createContext(null);

// export const useGlobalData = () => useContext(GlobalDataContext);

// export const GlobalDataProvider = ({ children }) => {
//     const [websiteContent, setWebsiteContent] = useState([]);
//     const [contentMap, setContentMap] = useState({});
//     const [user, setUser] = useState(null);
//     const [chatFlows, setChatFlows] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [refreshKey, setRefreshKey] = useState(0);

//     const refreshData = () => {
//         console.log('🔄 Manually refreshing GlobalData...');
//         setRefreshKey(prev => prev + 1);
//     };

//     useEffect(() => {
//         const fetchGlobalData = async () => {
//             setIsLoading(true);
//             setError(null);
//             try {
//                 console.log('📥 GlobalDataProvider: Fetching data... (refreshKey:', refreshKey, ')');


                
//                 // Fetch all shared data in parallel using base44 SDK
//              useEffect(() => {
//     const fetchGlobalData = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             console.warn('⚠️ GlobalDataProvider running in LOCAL MODE (Base44 disabled)');

//             // ✅ LOCAL SAFE DEFAULTS
//             setWebsiteContent([]);
//             setContentMap({});
//             setChatFlows([]);
//             setUser(null);

//         } catch (err) {
//             console.error('❌ GlobalDataProvider error:', err);
//             setError(err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     fetchGlobalData();
// }, [refreshKey]);



//           // ✅ 🔑 THIS IS THE IMPORTANT NORMALIZATION
// const contentData = contentRes?.data || contentRes || [];
// const flowsData = flowsRes?.data || flowsRes || [];


//                 console.log('📊 GlobalDataProvider: Loaded WebsiteContent records:', contentData.length);
                
//                 // Filter page_banners content and log
//               const pageBannersContent = contentData.filter(
//     item => item.section === 'page_banners' && item.is_active
// );
//                 console.log('🎨 GlobalDataProvider: Page Banners content:', pageBannersContent.length, 'active records');
                
//                 // Check for duplicates
//                 const keyCount = {};
//                 pageBannersContent.forEach(item => {
//                     keyCount[item.content_key] = (keyCount[item.content_key] || 0) + 1;
//                 });
//                 const duplicateKeys = Object.keys(keyCount).filter(key => keyCount[key] > 1);
//                 if (duplicateKeys.length > 0) {
//                     console.warn('⚠️ Duplicate content keys found:', duplicateKeys);
//                 }
                
//                 setWebsiteContent(contentData);
//                 setChatFlows(flowsData);

//                 // Pre-process WebsiteContent into a more usable map
//                 // IMPORTANT: Handle duplicates by preferring the most recently updated record
//                 const processedContentMap = contentData.reduce((acc, item) => {
//                     if (!item.is_active) {
//                         return acc;
//                     }
                    
//                     if (!acc[item.section]) {
//                         acc[item.section] = {};
//                     }
                    
//                     // Check if this key already exists
//                     const existingItem = acc[item.section][item.content_key];
                    
//                     // If it exists, only replace if this item is newer (higher updated_date or display_order)
//                     if (existingItem) {
//                         const existingDate = new Date(existingItem.updated_date || existingItem.created_date || 0);
//                         const newDate = new Date(item.updated_date || item.created_date || 0);
                        
//                         // Prefer newer updated_date, or higher display_order if dates are equal
//                         if (newDate < existingDate) {
//                             console.log(`⏭️ Skipping older duplicate: ${item.section}/${item.content_key}`);
//                             return acc; // Skip this older item
//                         } else if (newDate.getTime() === existingDate.getTime() && 
//                                    (item.display_order || 0) < (existingItem.order || 0)) {
//                             console.log(`⏭️ Skipping lower priority duplicate: ${item.section}/${item.content_key}`);
//                             return acc; // Skip this lower priority item
//                         }
                        
//                         console.log(`🔄 Replacing duplicate with newer: ${item.section}/${item.content_key}`);
//                     }
                    
//                     acc[item.section][item.content_key] = {
//                         value: item.content_value,
//                         tamil: item.content_value_tamil,
//                         order: item.display_order || 0,
//                         is_active: item.is_active,
//                         updated_date: item.updated_date,
//                         created_date: item.created_date
//                     };
//                     return acc;
//                 }, {});
                
//                 console.log('🗺️ GlobalDataProvider: Processed contentMap sections:', Object.keys(processedContentMap));
//                 if (processedContentMap.page_banners) {
//                     console.log('🎨 GlobalDataProvider: Page Banners keys in contentMap:', Object.keys(processedContentMap.page_banners));
//                     console.log('🎨 GlobalDataProvider: Sample prayer_request banner:', {
//                         title: processedContentMap.page_banners.prayer_request_title,
//                         image: processedContentMap.page_banners.prayer_request_image?.value?.substring(0, 50) + '...'
//                     });
//                 }
                
//                 setContentMap(processedContentMap);
//                 setUser(userData);
//             } catch (err) {
//                 console.error("❌ Error fetching global data:", err);
//                 setError(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGlobalData();
//     }, [refreshKey]);

//     // Function to allow components to re-check auth status, e.g., after login/logout
//     const checkUserAuth = async () => {
//         try {
//             const currentUser = await base44.auth.me();
//             setUser(currentUser);
//         } catch (error) {
//             setUser(null);
//         }
//     };
    
//     const value = {
//         websiteContent,
//         contentMap,
//         user,
//         chatFlows,
//         isLoading,
//         error,
//         checkUserAuth,
//         refreshData
//     };

//     return (
//         <GlobalDataContext.Provider value={value}>
//             {children}
//         </GlobalDataContext.Provider>
//     );
// };

import React, { createContext, useState, useEffect, useContext } from 'react';

const GlobalDataContext = createContext(null);
export const useGlobalData = () => useContext(GlobalDataContext);

export const GlobalDataProvider = ({ children }) => {
    const [websiteContent, setWebsiteContent] = useState([]);
    const [contentMap, setContentMap] = useState({});
    const [user, setUser] = useState(null);
    const [chatFlows, setChatFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshData = () => {
        console.log('🔄 Local refresh triggered');
        setRefreshKey(k => k + 1);
    };

    // ✅ ONLY ONE useEffect – TOP LEVEL
    useEffect(() => {
        console.warn('⚠️ GlobalDataProvider running in LOCAL MODE');

        setIsLoading(true);
        setError(null);

        try {
            // ✅ SAFE LOCAL DEFAULTS
            setWebsiteContent([]);
            setContentMap({});
            setChatFlows([]);
            setUser(null); // or load from localStorage later
        } catch (err) {
            console.error('❌ GlobalDataProvider error:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [refreshKey]);

    const checkUserAuth = async () => {
        // ❌ No base44
        setUser(null);
    };

    return (
        <GlobalDataContext.Provider
            value={{
                websiteContent,
                contentMap,
                user,
                chatFlows,
                isLoading,
                error,
                refreshData,
                checkUserAuth,
            }}
        >
            {children}
        </GlobalDataContext.Provider>
    );
};
