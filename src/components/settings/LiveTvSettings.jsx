// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Save, Tv, Info } from 'lucide-react';
// import { toast } from 'sonner';

// const LIVE_TV_SETTINGS = [
//   {
//     key: 'show_in_hero',
//     title: 'Show Live Video in Homepage Hero',
//     description: 'Display the live video player directly on the homepage hero section.',
//     type: 'boolean'
//   },
//   {
//     key: 'primary_stream_url',
//     title: 'Primary Live Stream URL (HLS/M3U8)',
//     description: 'The main video stream URL that will be used for live broadcasts.',
//     type: 'url',
//     required: true,
//   },
//   {
//     key: 'backup_stream_url',
//     title: 'Backup Live Stream URL (HLS/M3U8)',
//     description: 'A fallback stream URL in case the primary stream fails.',
//     type: 'url',
//     required: true,
//   },
//   {
//     key: 'enable_stream_failover',
//     title: 'Enable Automatic Stream Failover',
//     description: 'If the primary stream has issues, automatically switch to the backup stream.',
//     type: 'boolean'
//   },
// ];

// export default function LiveTvSettings({ settings, handleChange, handleSave }) {

//   const handleSaveWithValidation = (key, section) => {
//     const settingConfig = LIVE_TV_SETTINGS.find(s => s.key === key);
//     if (settingConfig.required && !settings[key]?.value) {
//         toast.error(`"${settingConfig.title}" is a required field and cannot be empty.`);
//         return;
//     }
//     handleSave(key, section);
//   };

//   const renderSetting = (setting) => {
//     const currentValue = settings[setting.key]?.value || (setting.type === 'boolean' ? 'false' : '');
//     const section = 'live_tv';

//     if (setting.type === 'boolean') {
//       return (
//         <div key={setting.key} className="p-4 border rounded-lg flex items-center justify-between">
//             <div className="flex-1 pr-4">
//               <Label htmlFor={setting.key} className="font-medium text-slate-800">{setting.title}</Label>
//               <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <Switch
//                 id={setting.key}
//                 checked={currentValue === 'true'}
//                 onCheckedChange={(checked) => handleChange(setting.key, checked ? 'true' : 'false', section)}
//               />
//               <Button onClick={() => handleSave(setting.key, section)} size="sm">
//                 <Save className="w-4 h-4" />
//               </Button>
//             </div>
//         </div>
//       );
//     }

//     return (
//       <div key={setting.key} className="space-y-2">
//         <Label htmlFor={setting.key}>
//           {setting.title}
//           {setting.required && <span className="text-red-500 ml-1">*</span>}
//         </Label>
//         <p className="text-sm text-slate-500">{setting.description}</p>
//         <div className="flex gap-2">
//           <Input
//             id={setting.key}
//             type="url"
//             value={currentValue}
//             onChange={(e) => handleChange(setting.key, e.target.value, section)}
//             placeholder="https://your-stream-provider/live.m3u8"
//             required={setting.required}
//           />
//           <Button onClick={() => handleSaveWithValidation(setting.key, section)}>
//             <Save className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>
//     );
//   };
  
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Tv className="w-5 h-5 text-slate-500" /> Live Video & Stream Settings
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
//             <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
//             <div>
//                 <h4 className="font-semibold text-blue-800">Configuration Note</h4>
//                 <p className="text-sm text-blue-700">
//                     The Primary and Backup Stream URLs are required for the live video player to function correctly. Please ensure these are valid HLS (.m3u8) links.
//                 </p>
//             </div>
//         </div>
//         {LIVE_TV_SETTINGS.map(setting => renderSetting(setting))}
//       </CardContent>
//     </Card>
//   );
// }