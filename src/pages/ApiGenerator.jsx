import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff,
  Download,
  Code,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ApiGenerator() {
  const [apiTokens, setApiTokens] = useState([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenScopes, setNewTokenScopes] = useState([]);
  const [showTokenValue, setShowTokenValue] = useState({});
  const [selectedEndpoint, setSelectedEndpoint] = useState('profile');

  const availableScopes = [
    { id: 'users', name: 'User Management', description: 'Read and update user profiles' },
    { id: 'bookings', name: 'Service Bookings', description: 'Create and manage bookings' },
    { id: 'donations', name: 'Donations', description: 'Process and track donations' },
    { id: 'programs', name: 'Program Schedule', description: 'Access program information' },
    { id: 'support', name: 'Support Tickets', description: 'Create and manage support tickets' }
  ];

  const apiEndpoints = {
    profile: {
      method: 'GET',
      url: '/api/mobile/profile',
      description: 'Get user profile information',
      requiredScopes: ['users'],
      sampleResponse: {
        success: true,
        data: {
          id: 'user_123',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+91XXXXXXXXXX',
          total_donations: 5000
        }
      }
    },
    bookings: {
      method: 'GET',
      url: '/api/mobile/bookings',
      description: 'Get user bookings',
      requiredScopes: ['bookings'],
      sampleResponse: {
        success: true,
        data: [
          {
            id: 'booking_123',
            service_type: 'holy_mass',
            beneficiary_name: 'Family',
            amount: 500,
            status: 'confirmed'
          }
        ]
      }
    },
    create_booking: {
      method: 'POST',
      url: '/api/mobile/bookings',
      description: 'Create a new booking',
      requiredScopes: ['bookings'],
      samplePayload: {
        service_type: 'holy_mass',
        beneficiary_name: 'Family Members',
        booking_date: '2024-12-25',
        intention_text: 'For family health and prosperity',
        amount: 500
      },
      sampleResponse: {
        success: true,
        data: {
          id: 'booking_456',
          service_type: 'holy_mass',
          status: 'confirmed'
        }
      }
    },
    donations: {
      method: 'GET',
      url: '/api/mobile/donations',
      description: 'Get user donations',
      requiredScopes: ['donations'],
      sampleResponse: {
        success: true,
        data: [
          {
            id: 'donation_123',
            amount: 1000,
            donation_type: 'one_time',
            payment_status: 'completed',
            created_date: '2024-01-15'
          }
        ]
      }
    },
    programs: {
      method: 'GET',
      url: '/api/mobile/programs',
      description: 'Get program schedule',
      requiredScopes: ['programs'],
      sampleResponse: {
        success: true,
        data: [
          {
            id: 'program_123',
            title: 'Daily Mass',
            schedule_date: '2024-12-25',
            schedule_time: '06:00',
            category: 'live_mass'
          }
        ]
      }
    }
  };

  useEffect(() => {
    loadApiTokens();
  }, []);

  const loadApiTokens = () => {
    // Simulate loading API tokens
    setApiTokens([
      {
        id: 1,
        name: 'Mobile App Token',
        token: 'madhatv_mobile_' + Math.random().toString(36).substr(2, 20),
        scopes: ['users', 'bookings', 'donations'],
        created_date: new Date().toISOString(),
        last_used: new Date().toISOString(),
        status: 'active'
      }
    ]);
  };

  const generateToken = () => {
    if (!newTokenName.trim()) {
      alert('Please enter a token name');
      return;
    }
    if (newTokenScopes.length === 0) {
      alert('Please select at least one scope');
      return;
    }

    const newToken = {
      id: Date.now(),
      name: newTokenName,
      token: 'madhatv_' + Math.random().toString(36).substr(2, 32),
      scopes: newTokenScopes,
      created_date: new Date().toISOString(),
      last_used: null,
      status: 'active'
    };

    setApiTokens([...apiTokens, newToken]);
    setNewTokenName('');
    setNewTokenScopes([]);
  };

  const toggleTokenVisibility = (tokenId) => {
    setShowTokenValue(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const revokeToken = (tokenId) => {
    setApiTokens(prev => prev.filter(token => token.id !== tokenId));
  };

  const toggleScope = (scopeId) => {
    setNewTokenScopes(prev => 
      prev.includes(scopeId) 
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  const downloadSDK = (platform) => {
    // Generate SDK documentation based on platform
    const sdkContent = generateSDKContent(platform);
    const blob = new Blob([sdkContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madhatv-${platform}-sdk.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSDKContent = (platform) => {
    const baseUrl = 'https://your-app-domain.com/api/mobile';
    
    return `# Madha TV ${platform.toUpperCase()} SDK Documentation

## Base URL
\`${baseUrl}\`

## Authentication
Include the following header in all requests:
\`\`\`
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

## Endpoints

### Get User Profile
\`\`\`
${apiEndpoints.profile.method} ${apiEndpoints.profile.url}
\`\`\`

### Get Bookings
\`\`\`
${apiEndpoints.bookings.method} ${apiEndpoints.bookings.url}
\`\`\`

### Create Booking
\`\`\`
${apiEndpoints.create_booking.method} ${apiEndpoints.create_booking.url}

Payload:
${JSON.stringify(apiEndpoints.create_booking.samplePayload, null, 2)}
\`\`\`

### Get Donations
\`\`\`
${apiEndpoints.donations.method} ${apiEndpoints.donations.url}
\`\`\`

### Get Programs
\`\`\`
${apiEndpoints.programs.method} ${apiEndpoints.programs.url}
\`\`\`

## Error Handling
All endpoints return a JSON response with a \`success\` field:
- \`success: true\` - Request successful, data in \`data\` field
- \`success: false\` - Request failed, error message in \`error\` field

## Sample Implementation (${platform})

${platform === 'ios' ? `
\`\`\`swift
import Foundation

class MadhaTVAPI {
    private let baseURL = "${baseUrl}"
    private let apiToken = "YOUR_API_TOKEN"
    
    func getProfile(completion: @escaping (Result<UserProfile, Error>) -> Void) {
        var request = URLRequest(url: URL(string: "\\(baseURL)/profile")!)
        request.setValue("Bearer \\(apiToken)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            // Handle response
        }.resume()
    }
}
\`\`\`
` : platform === 'android' ? `
\`\`\`java
public class MadhaTVAPI {
    private static final String BASE_URL = "${baseUrl}";
    private String apiToken;
    
    public void getProfile(Callback<UserProfile> callback) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
            .url(BASE_URL + "/profile")
            .addHeader("Authorization", "Bearer " + apiToken)
            .build();
            
        client.newCall(request).enqueue(callback);
    }
}
\`\`\`
` : `
\`\`\`javascript
const MadhaTVAPI = {
    baseURL: '${baseUrl}',
    apiToken: 'YOUR_API_TOKEN',
    
    async getProfile() {
        const response = await fetch(\`\${this.baseURL}/profile\`, {
            headers: {
                'Authorization': \`Bearer \${this.apiToken}\`
            }
        });
        return response.json();
    }
};
\`\`\`
`}

For more information, visit our documentation portal.
`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center h-64" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 to-slate-900/80" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-4 shadow-lg">API Generator</h1>
          <p className="text-slate-200 max-w-2xl text-xl shadow-lg">Generate API tokens and documentation for mobile app integration</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-20 relative z-10">
        <Tabs defaultValue="tokens" className="w-full">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-6">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <Key className="w-4 h-4" /> API Tokens
                </TabsTrigger>
                <TabsTrigger value="documentation" className="flex items-center gap-2">
                  <Code className="w-4 h-4" /> Documentation
                </TabsTrigger>
                <TabsTrigger value="sdk" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> SDK Download
                </TabsTrigger>
              </TabsList>
            </CardHeader>
          </Card>

          <TabsContent value="tokens" className="space-y-6">
            {/* Token Generation */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-slate-600" />
                  Generate New API Token
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Token name (e.g., Mobile App, Website Integration)"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                />
                
                <div>
                  <h4 className="font-semibold mb-3">Select Scopes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableScopes.map(scope => (
                      <div
                        key={scope.id}
                        onClick={() => toggleScope(scope.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          newTokenScopes.includes(scope.id)
                            ? 'border-[#B71C1C] bg-red-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border ${
                            newTokenScopes.includes(scope.id)
                              ? 'bg-[#B71C1C] border-[#B71C1C]'
                              : 'border-slate-300'
                          } flex items-center justify-center`}>
                            {newTokenScopes.includes(scope.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{scope.name}</p>
                            <p className="text-sm text-slate-500">{scope.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={generateToken} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                  Generate Token
                </Button>
              </CardContent>
            </Card>

            {/* Existing Tokens */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>Active Tokens ({apiTokens.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiTokens.map(token => (
                    <div key={token.id} className="p-4 border rounded-lg bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {token.name}
                            <Badge className={token.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {token.status}
                            </Badge>
                          </h4>
                          <p className="text-sm text-slate-500">
                            Created: {new Date(token.created_date).toLocaleDateString()}
                            {token.last_used && ` • Last used: ${new Date(token.last_used).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeToken(token.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          value={showTokenValue[token.id] ? token.token : '•'.repeat(32)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTokenVisibility(token.id)}
                        >
                          {showTokenValue[token.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(token.token)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {token.scopes.map(scope => (
                          <Badge key={scope} variant="outline">
                            {availableScopes.find(s => s.id === scope)?.name || scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Endpoint List */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(apiEndpoints).map(([key, endpoint]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedEndpoint(key)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedEndpoint === key
                          ? 'bg-[#B71C1C] text-white'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{endpoint.description}</span>
                        <Badge variant={selectedEndpoint === key ? 'secondary' : 'outline'}>
                          {endpoint.method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Endpoint Details */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      {apiEndpoints[selectedEndpoint]?.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Endpoint</h4>
                      <div className="flex items-center gap-2">
                        <Badge>{apiEndpoints[selectedEndpoint]?.method}</Badge>
                        <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                          {apiEndpoints[selectedEndpoint]?.url}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Required Scopes</h4>
                      <div className="flex gap-2">
                        {apiEndpoints[selectedEndpoint]?.requiredScopes.map(scope => (
                          <Badge key={scope} variant="outline">{scope}</Badge>
                        ))}
                      </div>
                    </div>

                    {apiEndpoints[selectedEndpoint]?.samplePayload && (
                      <div>
                        <h4 className="font-semibold mb-2">Sample Payload</h4>
                        <Textarea
                          value={JSON.stringify(apiEndpoints[selectedEndpoint].samplePayload, null, 2)}
                          readOnly
                          className="font-mono text-sm h-32"
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Sample Response</h4>
                      <Textarea
                        value={JSON.stringify(apiEndpoints[selectedEndpoint]?.sampleResponse, null, 2)}
                        readOnly
                        className="font-mono text-sm h-40"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sdk" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  SDK Documentation Download
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => downloadSDK('ios')}>
                    <CardContent className="p-6 text-center">
                      <Smartphone className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <h3 className="font-semibold mb-2">iOS SDK</h3>
                      <p className="text-sm text-slate-500 mb-4">Swift implementation guide</p>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download iOS
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => downloadSDK('android')}>
                    <CardContent className="p-6 text-center">
                      <Smartphone className="w-12 h-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-semibold mb-2">Android SDK</h3>
                      <p className="text-sm text-slate-500 mb-4">Java/Kotlin implementation</p>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Android
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => downloadSDK('web')}>
                    <CardContent className="p-6 text-center">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-semibold mb-2">Web SDK</h3>
                      <p className="text-sm text-slate-500 mb-4">JavaScript implementation</p>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Web
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Integration Notes</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• All API requests require authentication via Bearer token</li>
                        <li>• Rate limiting: 1000 requests per hour per token</li>
                        <li>• Base URL: https://your-domain.com/api/mobile</li>
                        <li>• All responses are in JSON format</li>
                        <li>• Use HTTPS for all production requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}