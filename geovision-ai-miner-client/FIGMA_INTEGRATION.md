# Figma Integration Guide for GeoVision AI Miner

This guide explains how to set up and use Figma integration with your GeoVision AI Miner frontend project.

## 🎨 **Overview**

The Figma integration allows you to:
- **Sync design tokens** (colors, typography, spacing) from Figma to your codebase
- **Generate React components** from Figma designs
- **Maintain design consistency** across your application
- **Automate the design-to-code workflow**

## 🛠️ **Setup Instructions**

### **Step 1: Get Figma Access Token**

1. **Go to Figma Settings:**
   - Open Figma in your browser
   - Click on your profile icon → Settings
   - Go to Account → Personal access tokens

2. **Create a New Token:**
   - Click "Generate new token"
   - Give it a name (e.g., "GeoVision AI Miner")
   - Copy the token (you won't see it again!)

3. **Set Environment Variable:**
   ```bash
   export FIGMA_ACCESS_TOKEN="your_figma_access_token_here"
   ```

### **Step 2: Get Figma File ID**

1. **Open your Figma design file**
2. **Copy the file ID from the URL:**
   ```
   https://www.figma.com/file/XXXXXXXXXXXXXXX/GeoVision-AI-Miner
   ```
   The `XXXXXXXXXXXXXXX` part is your file ID.

3. **Set Environment Variable:**
   ```bash
   export FIGMA_FILE_ID="your_figma_file_id_here"
   ```

### **Step 3: Update Configuration**

1. **Edit `figma-config.json`:**
   ```json
   {
     "figma": {
       "fileId": "your_figma_file_id_here",
       "accessToken": "your_figma_access_token_here",
       // ... rest of configuration
     }
   }
   ```

## 🚀 **Usage**

### **Generate Design Tokens**

```bash
# Generate CSS variables and TypeScript types from Figma
npm run generate-tokens
```

This will create:
- `src/styles/design-tokens.css` - CSS variables
- `src/styles/design-tokens.ts` - TypeScript types

### **Generate Components**

```bash
# Generate React components from Figma designs
npm run generate-components
```

This will create:
- `src/components/geologicalMap.tsx`
- `src/components/dataDashboard.tsx`
- `src/components/modelViewer.tsx`
- `src/components/analysisPanel.tsx`
- `src/components/index.ts` - Export file

### **Sync Everything**

```bash
# Generate both tokens and components
npm run figma-sync
```

## 📁 **File Structure**

```
geovision-ai-miner-client/
├── figma-config.json              # Figma configuration
├── scripts/
│   ├── generate-design-tokens.js   # Token generator
│   └── generate-figma-components.js # Component generator
├── src/
│   ├── styles/
│   │   ├── design-tokens.css      # Generated CSS variables
│   │   └── design-tokens.ts       # Generated TypeScript types
│   └── components/
│       ├── geologicalMap.tsx      # Generated component
│       ├── dataDashboard.tsx      # Generated component
│       ├── modelViewer.tsx        # Generated component
│       ├── analysisPanel.tsx      # Generated component
│       └── index.ts               # Component exports
└── FIGMA_INTEGRATION.md           # This guide
```

## 🎯 **Design Guidelines**

### **Component Naming in Figma**

Use these naming conventions in your Figma designs:

- **Geological Map:** `geological-map-component`
- **Data Dashboard:** `data-dashboard-component`
- **3D Model Viewer:** `3d-model-viewer`
- **Analysis Panel:** `analysis-panel`

### **Design Token Structure**

Organize your Figma design tokens as follows:

#### **Colors**
- Primary: `#1976d2`
- Secondary: `#dc004e`
- Success: `#4caf50`
- Warning: `#ff9800`
- Error: `#f44336`
- Geological:
  - Rock: `#8B4513`
  - Mineral: `#FFD700`
  - Soil: `#DEB887`
  - Water: `#4682B4`

#### **Typography**
- Font Family: `Roboto, sans-serif`
- H1: `2.5rem`
- H2: `2rem`
- H3: `1.75rem`
- Body: `1rem`
- Caption: `0.875rem`

#### **Spacing**
- XS: `0.25rem`
- SM: `0.5rem`
- MD: `1rem`
- LG: `1.5rem`
- XL: `2rem`

## 🔧 **Customization**

### **Adding New Components**

1. **Add to `figma-config.json`:**
   ```json
   {
     "figma": {
       "components": {
         "newComponent": {
           "nodeId": "new-component-node-id",
           "description": "Description of the new component"
         }
       }
     }
   }
   ```

2. **Add template to `generate-figma-components.js`:**
   ```javascript
   const componentTemplates = {
     // ... existing templates
     newComponent: \`
       // Your React component template here
     \`
   };
   ```

3. **Regenerate components:**
   ```bash
   npm run generate-components
   ```

### **Modifying Design Tokens**

1. **Update `figma-config.json`** with new token values
2. **Run the token generator:**
   ```bash
   npm run generate-tokens
   ```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"Access token invalid"**
- Check that your Figma access token is correct
- Ensure the token has the necessary permissions
- Regenerate the token if needed

#### **"File not found"**
- Verify the Figma file ID is correct
- Ensure you have access to the Figma file
- Check that the file is not private

#### **"Component not found"**
- Verify the node ID in `figma-config.json`
- Ensure the component exists in your Figma file
- Check the component naming conventions

### **Debug Mode**

Enable debug logging by setting:
```bash
export DEBUG=true
npm run generate-tokens
```

## 📚 **Best Practices**

### **Design Workflow**

1. **Design in Figma** with proper naming conventions
2. **Organize components** in logical frames
3. **Use design tokens** consistently
4. **Test components** in Figma before generating code
5. **Generate code** using the provided scripts
6. **Review and customize** generated components as needed

### **Code Organization**

1. **Keep generated files** in separate directories
2. **Don't edit generated files** directly
3. **Create wrapper components** for customization
4. **Use TypeScript interfaces** for type safety
5. **Follow accessibility guidelines**

### **Version Control**

1. **Commit generated files** to version control
2. **Document changes** in commit messages
3. **Use branches** for design iterations
4. **Review generated code** before merging

## 🔄 **Automation**

### **GitHub Actions Integration**

Add this to your `.github/workflows/ci-cd.yml`:

```yaml
- name: Generate Design Tokens
  run: |
    cd geovision-ai-miner-client
    npm run generate-tokens
  env:
    FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
    FIGMA_FILE_ID: ${{ secrets.FIGMA_FILE_ID }}
```

### **Pre-commit Hooks**

Add to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run figma-sync"
    }
  }
}
```

## 📞 **Support**

For issues and questions:
1. Check the troubleshooting section above
2. Review the generated code for errors
3. Verify your Figma configuration
4. Contact the development team

## 🎉 **Next Steps**

1. **Set up your Figma file** with the recommended structure
2. **Configure your access token** and file ID
3. **Generate your first components** using the scripts
4. **Customize the generated code** for your specific needs
5. **Integrate with your React application**

Happy designing! 🎨 