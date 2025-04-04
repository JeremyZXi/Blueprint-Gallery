import { useState, useEffect, useMemo } from "react";
import { fetchApprovedSubmissions, formatSubmissionsForGallery } from "../utils/fetchSupabase";
import IADetailView from "./IADetailView";
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';

interface IAItem {
  id: string;
  pdf: string | null;
  images: string[];
  tags: string[]; // Store all tags for filtering
  title?: string;
  creator?: string;
  gradeLevel?: string;
  submissionDate?: string;
  description?: string;
}

const Gallery = () => {
  const [ias, setIAs] = useState<IAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIA, setSelectedIA] = useState<IAItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Available filter categories
  const filterCategories = {
    material: ["Alloy", "Wood", "Plastic", "Glass", "Fabric", "Composite"],
    color: ["Red", "Blue", "Green", "Black", "White", "Yellow"],
    function: [
      "Organization & Storage",
      "Life Improvement & Decor",
      "Health & Wellness",
      "Innovative Gadgets & Tools",
      "Accessibility & Mobility Solutions"
    ]
  };

  // Initialize Fuse for fuzzy search
  const fuseOptions = {
    keys: ['title', 'creator', 'description', 'tags'],
    threshold: 0.4, // Lower value means more exact matching (0.0 = exact, 1.0 = match everything)
    includeScore: true
  };

  const fuse = useMemo(() => 
    new Fuse(ias, fuseOptions), 
    [ias]
  );

  useEffect(() => {
    async function loadApprovedIAs() {
      setLoading(true);
      try {
        const submissions = await fetchApprovedSubmissions();
        console.log('Fetched submissions:', submissions);
        
        const formattedSubmissions = formatSubmissionsForGallery(submissions);
        console.log('Formatted submissions:', formattedSubmissions);
        
        // For testing, if no submissions, create some mock data
        if (formattedSubmissions.length === 0) {
          console.log('No submissions found, creating mock data');
          const mockData = [
            {
              id: '1',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?desk'],
              tags: ['material_Wood', 'function_Organization & Storage', 'color_Brown'],
              title: 'Wooden Desk Organizer',
              creator: 'John Doe',
              gradeLevel: '11',
              submissionDate: '2023-04-15',
              description: 'A handcrafted wooden desk organizer with multiple compartments.'
            },
            {
              id: '2',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?lamp'],
              tags: ['material_Metal', 'function_Life Improvement & Decor', 'color_Silver'],
              title: 'Adjustable LED Lamp',
              creator: 'Jane Smith',
              gradeLevel: '12',
              submissionDate: '2023-05-20',
              description: 'An energy-efficient LED lamp with adjustable brightness and color temperature.'
            },
            {
              id: '3',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?device'],
              tags: ['material_Plastic', 'function_Health & Wellness', 'color_White'],
              title: 'Portable Air Purifier',
              creator: 'Alex Johnson',
              gradeLevel: '10',
              submissionDate: '2023-06-10',
              description: 'A compact air purifier that removes allergens and pollutants.'
            },
            {
              id: '4',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?tool'],
              tags: ['material_Composite', 'function_Innovative Gadgets & Tools', 'color_Blue'],
              title: 'Multi-tool Pocket Device',
              creator: 'Sarah Williams',
              gradeLevel: '11',
              submissionDate: '2023-07-05',
              description: 'A versatile pocket-sized multi-tool with 15 different functions.'
            },
            {
              id: '5',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?chair'],
              tags: ['material_Wood', 'function_Accessibility & Mobility Solutions', 'color_Brown'],
              title: 'Ergonomic Study Chair',
              creator: 'Michael Brown',
              gradeLevel: '12',
              submissionDate: '2023-08-18',
              description: 'An ergonomically designed chair to improve posture during long study sessions.'
            },
            {
              id: '6',
              pdf: null,
              images: ['https://source.unsplash.com/random/800x600?container'],
              tags: ['material_Glass', 'function_Organization & Storage', 'color_Clear'],
              title: 'Modular Storage System',
              creator: 'Emily Chen',
              gradeLevel: '10',
              submissionDate: '2023-09-22',
              description: 'A customizable modular storage system for efficient organization.'
            }
          ];
          setIAs(mockData);
        } else {
          setIAs(formattedSubmissions);
        }
      } catch (error) {
        console.error("Failed to load gallery items:", error);
        // Create mock data if error occurs
        console.log('Error occurred, loading mock data');
        setIAs([
          {
            id: '1',
            pdf: null,
            images: ['https://source.unsplash.com/random/800x600?desk'],
            tags: ['material_Wood', 'function_Organization & Storage', 'color_Brown'],
            title: 'Wooden Desk Organizer',
            creator: 'John Doe',
            gradeLevel: '11',
            submissionDate: '2023-04-15',
            description: 'A handcrafted wooden desk organizer with multiple compartments.'
          },
          {
            id: '2',
            pdf: null,
            images: ['https://source.unsplash.com/random/800x600?lamp'],
            tags: ['material_Metal', 'function_Life Improvement & Decor', 'color_Silver'],
            title: 'Adjustable LED Lamp',
            creator: 'Jane Smith',
            gradeLevel: '12',
            submissionDate: '2023-05-20',
            description: 'An energy-efficient LED lamp with adjustable brightness and color temperature.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadApprovedIAs();
  }, []);

  const handleFilterSelect = (category: string, value: string) => {
    setSelectedCategory(category);
    setActiveFilter(value);
    // Clear search query when using category filters
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setActiveFilter(null);
  };

  const handleIAClick = (ia: IAItem) => {
    setSelectedIA(ia);
  };

  const closeDetailView = () => {
    setSelectedIA(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear category filters when searching
    if (e.target.value) {
      setSelectedCategory(null);
      setActiveFilter(null);
    }
  };

  // Extract tag categories for display
  const getCategoryFromTags = (ia: IAItem, categoryPrefix: string): string[] => {
    return ia.tags
        .filter(tag => tag.startsWith(`${categoryPrefix}_`))
        .map(tag => tag.replace(`${categoryPrefix}_`, ''));
  };

  // Filter IAs based on selected filter and search query
  const filteredIAs = useMemo(() => {
    // If we have a search query, use fuzzy search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      return searchResults.map(result => result.item);
    }
    
    // Otherwise use category filters
    if (activeFilter && selectedCategory) {
      return ias.filter(ia => 
        ia.tags.some(tag => tag === `${selectedCategory}_${activeFilter}`)
      );
    }
    
    // No filters, return all
    return ias;
  }, [ias, activeFilter, selectedCategory, searchQuery, fuse]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-2 py-4">
        {/* Search Bar */}
        <div className="mb-4 max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by title, creator, or keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Filter Controls - Only show when not searching */}
        {!searchQuery && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {Object.entries(filterCategories).map(([category, values]) => (
                  <div key={category} className="flex flex-col items-center">
                    <h3 className="font-semibold capitalize mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-1">
                      {values.map(value => (
                          <button
                              key={value}
                              onClick={() => handleFilterSelect(category, value)}
                              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                  activeFilter === value && selectedCategory === category
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-200 hover:bg-gray-300"
                              }`}
                          >
                            {value}
                          </button>
                      ))}
                    </div>
                  </div>
              ))}
            </div>

            {activeFilter && (
                <div className="flex justify-center">
                  <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                  >
                    Clear Filter: {activeFilter}
                  </button>
                </div>
            )}
          </div>
        )}

        {/* Search query display */}
        {searchQuery && (
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center">
              <span>Search results for: <strong>{searchQuery}</strong></span>
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredIAs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No projects found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Show All Projects
              </button>
            </div>
        ) : (
            <div className="masonry-grid">
              {filteredIAs.map((ia, index) => {
                // 为图片设置随机高度
                const randomHeight = () => {
                  const heights = ["h-64", "h-72", "h-80", "h-96", "h-56"];
                  return heights[Math.floor(Math.random() * heights.length)];
                };
                
                const imageHeight = randomHeight();
                
                return (
                  <div
                    key={ia.id}
                    className="masonry-item"
                    onClick={() => handleIAClick(ia)}
                  >
                    {ia.images && ia.images.length > 0 ? (
                      <>
                        <div className="relative">
                          <img
                            src={ia.images[0]}
                            alt={ia.title || "IA Project"}
                            className={`w-full ${imageHeight} object-cover`}
                          />
                          {/* 图片底部渐变遮罩和标签 */}
                          <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
                            {ia.tags && ia.tags.length > 0 && 
                              <div className="flex flex-wrap gap-1 mb-1">
                                {ia.tags
                                  .filter(tag => tag.includes('_'))
                                  .slice(0, 3)
                                  .map((tag, idx) => {
                                    const tagValue = tag.split('_')[1];
                                    return (
                                      <span
                                        key={idx}
                                        className="image-tag"
                                      >
                                        # {tagValue}
                                      </span>
                                    );
                                  })
                                }
                              </div>
                            }
                          </div>
                        </div>
                        
                        {/* 小红书风格的卡片底部 */}
                        <div className="xiaohongshu-caption">
                          <h2>{ia.title || "Untitled Project"}</h2>
                          <div className="flex items-center">
                            <div className="xiaohongshu-author">
                              <span>{ia.creator || "Anonymous"}</span>
                              {ia.gradeLevel && (
                                <span className="text-gray-400 text-xs ml-2">
                                  Grade {ia.gradeLevel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={`flex items-center justify-center ${imageHeight} bg-gray-200`}>
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        )}

        {/* Detail View Modal */}
        {selectedIA && (
            <IADetailView
                id={selectedIA.id}
                title={selectedIA.title || "Untitled Project"}
                creator={selectedIA.creator || "Anonymous"}
                submissionDate={selectedIA.submissionDate}
                category={getCategoryFromTags(selectedIA, 'function')[0]}
                tags={[
                  ...getCategoryFromTags(selectedIA, 'material'),
                  ...getCategoryFromTags(selectedIA, 'color'),
                  ...getCategoryFromTags(selectedIA, 'function')
                ]}
                description={selectedIA.description}
                images={selectedIA.images}
                pdfUrl={selectedIA.pdf || undefined}
                onClose={closeDetailView}
            />
        )}
      </div>
  );
};

export default Gallery; 