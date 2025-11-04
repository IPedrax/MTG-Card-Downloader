// MTG Card Image Downloader - Main Script

class MTGCardDownloader {
  constructor() {
    this.cards = [];
    this.successfulDownloads = [];
    this.failedDownloads = [];
    this.zipBlob = null;
    
    // UI Elements
    this.deckListInput = document.getElementById('deckList');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.progressSection = document.getElementById('progressSection');
    this.progressBar = document.getElementById('progressBar');
    this.progressText = document.getElementById('progressText');
    this.resultsSection = document.getElementById('resultsSection');
    this.successMessage = document.getElementById('successMessage');
    this.successText = document.getElementById('successText');
    this.downloadZipBtn = document.getElementById('downloadZipBtn');
    this.errorMessage = document.getElementById('errorMessage');
    this.errorSummary = document.getElementById('errorSummary');
    this.errorList = document.getElementById('errorList');
    this.downloadPartialZipBtn = document.getElementById('downloadPartialZipBtn');
    this.completeErrorMessage = document.getElementById('completeErrorMessage');
    this.completeErrorText = document.getElementById('completeErrorText');
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    this.downloadBtn.addEventListener('click', () => this.startDownload());
    this.downloadZipBtn.addEventListener('click', () => this.saveZipFile());
    this.downloadPartialZipBtn.addEventListener('click', () => this.saveZipFile());
  }
  
  async startDownload() {
    // Reset state
    this.cards = [];
    this.successfulDownloads = [];
    this.failedDownloads = [];
    this.zipBlob = null;
    
    // Get deck list
    const deckListText = this.deckListInput.value.trim();
    
    if (!deckListText) {
      alert('Please enter a deck list!');
      return;
    }
    
    // Parse deck list
    this.showProgress('Parsing deck list...');
    const parseResult = this.parseDeckList(deckListText);
    
    if (parseResult.errors.length > 0) {
      this.showCompleteError('Invalid deck list format:\n\n' + parseResult.errors.join('\n'));
      return;
    }
    
    if (parseResult.cards.length === 0) {
      this.showCompleteError('No valid cards found in deck list.');
      return;
    }
    
    this.cards = parseResult.cards;
    
    // Disable button
    this.downloadBtn.disabled = true;
    
    // Download cards
    await this.downloadAllCards();
    
    // Create ZIP
    if (this.successfulDownloads.length > 0) {
      await this.createZipFile();
    }
    
    // Show results
    this.showResults();
    
    // Re-enable button
    this.downloadBtn.disabled = false;
  }
  
  parseDeckList(text) {
    const lines = text.split('\n');
    const cards = [];
    const errors = [];
	    // Regex pattern for full format: [quantity] CARDNAME (SET) CN *F/E*
	    // Quantity is optional, defaulting to 1 if not present.
	    // Group 1: Optional quantity (\d+\s+)?
	    // Group 2: Card Name (.+?)
	    // Group 3: Set Code ([A-Z0-9]+)
	    // Group 4: Collector Number (\S+)
	    // Group 5: Optional Finish ([FE])
	    const fullPattern = /^(?:(\d+)\s+)?(.+?)\s+\(([A-Z0-9]+)\)\s+(\S+)(?:\s+\*([FE])\*)?$/i;
	    
	    // Regex pattern for fallback: [quantity] CARDNAME
	    // Group 1: Optional quantity (\d+\s+)?
	    // Group 2: Card Name (.+?)
	    const fallbackPattern = /^(?:(\d+)\s+)?(.+?)$/i;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      let match = trimmedLine.match(fullPattern);
      
      if (match) {
	        // Full format match
	        const [, quantityStr, cardName, setCode, collectorNumber, finish] = match;
	        const quantity = quantityStr ? parseInt(quantityStr) : 1; // Default to 1
	        cards.push({
	          quantity: quantity,
	          name: cardName.trim(),
	          set: setCode.toUpperCase(),
	          collectorNumber: collectorNumber,
	          finish: finish || null,
	          originalLine: trimmedLine,
	          fallback: false // Not a fallback card
	        });
      } else {
	        // Try fallback format
	        match = trimmedLine.match(fallbackPattern);
	        if (match) {
	          const [, quantityStr, cardName] = match;
	          const quantity = quantityStr ? parseInt(quantityStr) : 1; // Default to 1
	          cards.push({
	            quantity: quantity,
	            name: cardName.trim(),
	            set: null, // Missing set
	            collectorNumber: null, // Missing CN
	            finish: null, // Missing finish
	            originalLine: trimmedLine,
	            fallback: true // Is a fallback card
	          });
	        } else {
          // Still no match, report error
          errors.push(`Line ${index + 1}: "${trimmedLine}"`);
        }
      }
    });
    
    return { cards, errors };
  }
  
  async downloadAllCards() {
    const totalCards = this.cards.length;
    
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const progress = ((i + 1) / totalCards) * 100;
      
	      this.updateProgress(
	        progress,
	        `Downloading ${i + 1}/${totalCards}: ${card.name}${card.set ? ` (${card.set})` : ' (Default Print)'}${card.name.includes('/') ? ' (Checking for DS)' : ''}`
	      );
      
      try {
	        const imageResult = await this.downloadCardImage(card);
	        
	        if (Array.isArray(imageResult)) {
	          // Double-sided card: imageResult is an array of { blob, name, isDoubleSided }
	          imageResult.forEach(face => {
	            this.successfulDownloads.push({
	              card,
	              imageBlob: face.blob,
	              faceName: face.name,
	              isDoubleSided: true
	            });
	          });
	        } else {
	          // Single-sided card: imageResult is { blob, isDoubleSided }
	          this.successfulDownloads.push({
	            card,
	            imageBlob: imageResult.blob,
	            isDoubleSided: false
	          });
	        }
      } catch (error) {
        this.failedDownloads.push({
          card,
          error: error.message
        });
      }
      
      // Rate limiting: 100ms delay between requests
      if (i < this.cards.length - 1) {
        await this.sleep(100);
      }
    }
  }
  
	  async downloadCardImage(card) {
	    let url;
	    if (card.fallback) {
	      // Fallback: search by name only
	      url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.name)}`;
	    } else {
	      // Primary: search by set and collector number
	      url = `https://api.scryfall.com/cards/${card.set.toLowerCase()}/${card.collectorNumber}`;
	    }
	    
	    try {
	      // Fetch card data from Scryfall API
	      const response = await fetch(url, {
	        headers: {
	          'Accept': 'application/json',
	          'User-Agent': 'MTGCardDownloader/1.0'
	        }
	      });
	      
	      if (!response.ok) {
	        if (response.status === 404) {
	          const errorData = await response.json();
	          throw new Error(errorData.details || 'Card not found');
	        } else if (response.status === 429) {
	          throw new Error('Rate limited');
	        } else {
	          throw new Error(`HTTP ${response.status}`);
	        }
	      }
	      
	      const cardData = await response.json();
	      
	      // --- Double-Sided Card Logic ---
	      if (cardData.card_faces && cardData.card_faces.length > 1) {
	        const faceBlobs = [];
	        for (const face of cardData.card_faces) {
	          const faceImageUrl = face.image_uris ? (face.image_uris.large || face.image_uris.normal) : null;
	          
	          if (faceImageUrl) {
	            const faceImageResponse = await fetch(faceImageUrl);
	            if (!faceImageResponse.ok) {
	              throw new Error(`Failed to download image for face: ${face.name}`);
	            }
	            const faceImageBlob = await faceImageResponse.blob();
	            faceBlobs.push({
	              blob: faceImageBlob,
	              name: face.name,
	              isDoubleSided: true
	            });
	          }
	        }
	        if (faceBlobs.length === 0) {
	          throw new Error('No image available for any card face');
	        }
	        return faceBlobs; // Return array of blobs for DS cards
	      }
	      // --- End Double-Sided Card Logic ---
	      
	      // Single-faced card logic
	      let imageUrl;
	      if (cardData.image_uris) {
	        imageUrl = cardData.image_uris.large || cardData.image_uris.normal;
	      } else {
	        throw new Error('No image available');
	      }
	      
	      // Download image
	      const imageResponse = await fetch(imageUrl);
	      
	      if (!imageResponse.ok) {
	        throw new Error('Failed to download image');
	      }
	      
	      const imageBlob = await imageResponse.blob();
	      return {
	        blob: imageBlob,
	        isDoubleSided: false
	      }; // Return single blob object for normal cards
	      
	    } catch (error) {
	      throw error;
	    }
	  }
  
  async createZipFile() {
    this.updateProgress(100, 'Creating ZIP file...');
    
    const zip = new JSZip();
    
	    // Add each image to the ZIP
	    this.successfulDownloads.forEach(({ card, imageBlob, faceName, isDoubleSided }) => {
	      // Create filename: quantity x_CardName_SET_CN.jpg
	      const sanitizedName = card.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
	      // Use set and CN if available, otherwise use a placeholder
	      const setPart = card.set || 'DEFAULT';
	      const cnPart = card.collectorNumber || '000';
	      const finishSuffix = card.finish ? `_${card.finish}` : '';
	      
	      let filename;
	      if (isDoubleSided) {
	        // For double-sided cards, save in DS folder and include face name
	        const sanitizedFaceName = faceName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
	        filename = `DS/${card.quantity}x_${sanitizedName}_${setPart}_${cnPart}_${sanitizedFaceName}${finishSuffix}.jpg`;
	      } else {
	        // Single-sided card
	        filename = `${card.quantity}x_${sanitizedName}_${setPart}_${cnPart}${finishSuffix}.jpg`;
	      }
	      
	      zip.file(filename, imageBlob);
	    });
    
    // Generate ZIP blob
    this.zipBlob = await zip.generateAsync({ type: 'blob' });
  }
  
  showResults() {
    this.progressSection.style.display = 'none';
    this.resultsSection.style.display = 'block';
    
    if (this.failedDownloads.length === 0) {
      // All cards downloaded successfully
      this.successMessage.style.display = 'block';
      this.successText.textContent = `Successfully downloaded ${this.successfulDownloads.length} card image(s)!`;
      this.errorMessage.style.display = 'none';
      this.completeErrorMessage.style.display = 'none';
    } else if (this.successfulDownloads.length > 0) {
      // Some cards failed
      this.errorMessage.style.display = 'block';
      this.errorSummary.textContent = `Downloaded ${this.successfulDownloads.length} card(s), but ${this.failedDownloads.length} card(s) could not be found:`;
      
      // Show failed cards list
      this.errorList.innerHTML = '';
      this.failedDownloads.forEach(({ card, error }) => {
        const li = document.createElement('li');
        li.textContent = `${card.name} (${card.set}) ${card.collectorNumber} - ${error}`;
        this.errorList.appendChild(li);
      });
      
      this.downloadPartialZipBtn.style.display = 'block';
      this.successMessage.style.display = 'none';
      this.completeErrorMessage.style.display = 'none';
    } else {
      // All cards failed
      this.completeErrorMessage.style.display = 'block';
      this.completeErrorText.textContent = 'Failed to download any cards. Please check your deck list format and try again.';
      this.successMessage.style.display = 'none';
      this.errorMessage.style.display = 'none';
    }
  }
  
  saveZipFile() {
    if (!this.zipBlob) return;
    
    // Create download link
    const url = URL.createObjectURL(this.zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mtg_cards_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  showProgress(message) {
    this.progressSection.style.display = 'block';
    this.resultsSection.style.display = 'none';
    this.progressBar.style.width = '0%';
    this.progressText.textContent = message;
  }
  
  updateProgress(percentage, message) {
    this.progressBar.style.width = `${percentage}%`;
    this.progressText.textContent = message;
  }
  
  showCompleteError(message) {
    this.progressSection.style.display = 'none';
    this.resultsSection.style.display = 'block';
    this.completeErrorMessage.style.display = 'block';
    this.completeErrorText.textContent = message;
    this.successMessage.style.display = 'none';
    this.errorMessage.style.display = 'none';
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MTGCardDownloader();
});
