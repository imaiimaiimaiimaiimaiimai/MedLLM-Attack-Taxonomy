# Medical LLM Attack Taxonomy Interactive Web Explorer

An interactive web application to visualize and explore adversarial attacks on medical AI systems. This tool enables researchers, developers, and policymakers to filter, search, compare, and understand attack patterns through rich visualizations and interactive data exploration.

🔗 **Live Demo**: https://imaiimaiimaiimaiimaiimai.github.io/MedLLM-Attack-Taxonomy/

## 🚀 Features

### Core Functionality

- **Advanced Data Processing**: Automated extraction of attack modalities, types, severity, success rates, and tags from CSV data
- **Multi-Page Navigation**: Dashboard, Explorer, Comparison, and References pages
- **Real-time Search**: Debounced search (300ms) with recent searches history
- **Advanced Filtering**:
  - Multi-select filters for modalities, attack types, and severity levels
  - Year range slider (2019-2025)
  - Tags filter with auto-generated tags
  - URL-based filter persistence
  - Active filter count badge
  - Clear all filters functionality

### Explorer Page

- **Attack Cards**: Grid and list view modes
- **Virtual Scrolling**: High-performance rendering for large datasets
- **Attack Comparison**: Select 2-3 attacks to compare side-by-side
- **Attack Details Modal**: Expandable view with full attack information
- **Empty States**: User-friendly messages when no results found
- **Skeleton Loaders**: Smooth loading experience

### Comparison Page

- **Similarity Analysis**: Automatic calculation of attack similarity scores
- **Side-by-Side Matrix**: Detailed feature comparison
- **Export Options**: Export comparisons to CSV or Markdown
- **Visual Indicators**: Highlighting of best/worst values across attacks
- **Interactive Navigation**: Easy back-to-explorer functionality

### Dashboard

- **Interactive Table**:
  - Sortable columns (Name, Category, Severity, Success Rate)
  - Expandable rows with full attack details
  - Virtual scrolling for performance
  - Color-coded severity badges
  - Success rate progress bars
  - External reference links

- **Statistics Cards**: Real-time metrics showing:
  - Total attacks (updates with filters)
  - Average success rate
  - Most common modality
  - Critical attack count

- **Visualizations**:
  - **Success Rate Chart**: Top 15 attacks by success rate
  - **Severity Distribution**: Interactive pie chart with click-to-filter
  - **Taxonomy Tree**: D3.js hierarchical tree showing attack categories
  - **Attack Heatmap**: D3.js heatmap showing Modality × Attack Type matrix
  - **Network Graph**: Interactive force-directed graph showing attack relationships

### References Page

- **Citation Management**: Group by year or author
- **Export Citations**: APA or BibTeX format
- **Reference Statistics**: Visual overview of publication timeline

### UI/UX Enhancements

- **Skeleton Loaders**: Smooth loading states for all pages
- **Empty States**: Contextual messages with helpful actions
- **Recent Searches**: Quick access to previous search queries
- **Keyboard Shortcuts**:
  - `/` - Focus search
  - `Ctrl+K` - Clear filters
  - `?` - Show help dialog
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Mode**: Automatic system preference detection

## 🏗️ Architecture

```
src/
├── components/
│   ├── layout/          # Header, Navigation
│   ├── filters/         # SearchBar, FilterPanel
│   ├── visualizations/  # Charts and graphs
│   ├── dashboard/       # StatsCards, Tables, Grids
│   ├── comparison/      # Comparison matrix
│   ├── empty-states/    # Empty state components
│   ├── loaders/         # Skeleton loaders
│   └── ui/              # shadcn/ui components
├── data/
│   ├── attacks.csv      # Source data
│   └── dataProcessor.ts # Data extraction & processing
├── store/
│   └── filterStore.ts   # Zustand state management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── pages/               # Dashboard, Explorer, References, Comparison
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/imaiimaiimaiimaiimaiimai/MedLLM-Attack-Taxonomy.git
cd MedLLM-Attack-Taxonomy

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🎯 Usage

### Exploring Attacks

1. Navigate to the **Explorer** page
2. Use filters in the left sidebar (modality, attack type, severity)
3. Search for specific attacks using the search bar
4. Switch between grid and list views
5. Click on attack cards to view details
6. Select attacks using the compare button (checkbox icon)

### Comparing Attacks

1. Select 2-3 attacks from the Explorer page
2. Click "View Detailed Comparison"
3. Review similarity scores and feature matrix
4. Export comparison to CSV or Markdown

### Viewing Statistics

1. Go to the **Dashboard** page
2. View real-time statistics cards
3. Explore different visualization tabs:
   - **Overview**: Interactive table with all attacks
   - **Taxonomy**: Hierarchical tree view
   - **Charts**: Success rate and severity charts
   - **Network**: Force-directed graph of attack relationships

### Managing References

1. Navigate to the **References** page
2. Group citations by year or author
3. Export to APA or BibTeX format
4. View publication timeline

## 🔧 Technology Stack

- **React 18+** with TypeScript - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **React Router** - Navigation
- **Recharts** - Charting library
- **D3.js** - Advanced visualizations
- **React Window** - Virtual scrolling
- **Papaparse** - CSV parsing
- **Lodash** - Utility functions

## 📊 Data Structure

The application processes CSV data and extracts:

- **Modalities**: Text, Image, Image+Text, Training Data
- **Attack Types**: Prompt Injection, Jailbreaking, Data Poisoning, Adversarial Perturbation, Model Inversion, etc.
- **Severity**: Critical, High, Medium (computed from description keywords)
- **Success Rate**: Extracted from research paper descriptions
- **Tags**: Auto-generated from content (clinical, radiology, fraud, security, privacy, etc.)
- **References**: Author, year, and paper URLs

## 🎨 Customization

### Adding New Filters

1. Update `src/data/dataProcessor.ts` to extract new metadata
2. Add filter logic in `src/store/filterStore.ts`
3. Create filter UI in `src/components/filters/FilterPanel.jsx`

### Adding New Visualizations

1. Create component in `src/components/visualizations/`
2. Import and add to Dashboard tabs
3. Connect to Zustand store for filtered data

## ✅ Feature Completion Status

### Implemented Features

- ✅ TypeScript migration (core infrastructure)
- ✅ Virtual scrolling for performance
- ✅ Network graph visualization
- ✅ Advanced attack comparison
- ✅ Skeleton loaders
- ✅ Empty state graphics
- ✅ Recent searches
- ✅ URL-based filter persistence
- ✅ Multi-page navigation
- ✅ Export functionality (CSV, Markdown, Citations)
- ✅ Responsive design
- ✅ Keyboard shortcuts

### Future Enhancements

- [ ] Complete TypeScript migration (all components)
- [ ] Dark mode toggle UI
- [ ] Advanced search with operators (AND, OR, NOT)
- [ ] Attack timeline view
- [ ] PDF export of reports
- [ ] Automated testing suite
- [ ] Attack detail permalinks
- [ ] Social sharing functionality

## 🚦 Performance Optimizations

- **Virtual Scrolling**: Renders only visible items for large datasets
- **Debounced Search**: Reduces unnecessary API calls
- **Memoization**: Optimized component re-renders
- **Code Splitting**: Lazy-loaded routes
- **Efficient State Management**: Zustand with minimal re-renders

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

## 🤝 Contributing

This is a research project. For questions or contributions, please open an issue on GitHub.

## 📄 License

ISC

## 🔗 Links

- **Repository**: https://github.com/imaiimaiimaiimaiimaiimai/MedLLM-Attack-Taxonomy
- **Documentation**: [Wiki](https://github.com/imaiimaiimaiimaiimaiimai/MedLLM-Attack-Taxonomy/wiki)

## 📧 Contact

For questions about the Medical LLM Attack Taxonomy, please open an issue on GitHub.

---

Built with ❤️ for medical AI security research
