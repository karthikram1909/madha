/**
 * Maps program titles to appropriate image filenames based on uploaded images
 * @param {string} title - The program title to map
 * @param {Array} uploadedImages - Array of uploaded image objects with filename property
 * @returns {string} - The filename of the appropriate image
 */
export const getProgramImage = (title, uploadedImages = []) => {
    if (!title || typeof title !== 'string') {
        return 'madhatv.png'; // Default fallback
    }

    // Normalize title for comparison
    let normalizedTitle = title.toUpperCase().trim();
    
    // Remove "NEW!" prefix if present
    if (normalizedTitle.startsWith('NEW!')) {
        normalizedTitle = normalizedTitle.substring(4).trim();
    }

    // If we have uploaded images, try to match dynamically
    if (uploadedImages && uploadedImages.length > 0) {
        // Normalize filename helper - removes extension and normalizes spaces/underscores
        const normalizeFilename = (filename) => {
            return filename
                .replace(/\.(jpg|jpeg|png|webp)$/i, '')
                .replace(/[_-]/g, ' ')  // Replace underscores and hyphens with spaces
                .toUpperCase()
                .trim()
                .replace(/\s+/g, ' ');  // Normalize multiple spaces to single space
        };
        
        // Normalize title for comparison
        const normalizedTitleForMatch = normalizedTitle.replace(/[_-]/g, ' ').replace(/\s+/g, ' ');

        // First try exact match (filename without extension matches title)
        for (const img of uploadedImages) {
            const normalizedFilename = normalizeFilename(img.filename);
            if (normalizedFilename === normalizedTitleForMatch) {
                return img.filename;
            }
        }

        // Then try partial match (title contains filename or filename contains title)
        for (const img of uploadedImages) {
            const normalizedFilename = normalizeFilename(img.filename);
            if (normalizedTitleForMatch.includes(normalizedFilename) || normalizedFilename.includes(normalizedTitleForMatch)) {
                return img.filename;
            }
        }

        // Try word-based matching for better flexibility
        const titleWords = normalizedTitleForMatch.split(/\s+/).filter(w => w.length > 2);
        let bestMatch = null;
        let bestMatchScore = 0;

        for (const img of uploadedImages) {
            const normalizedFilename = normalizeFilename(img.filename);
            const filenameWords = normalizedFilename.split(/\s+/).filter(w => w.length > 2);
            
            // Count matching words
            let matchScore = 0;
            for (const titleWord of titleWords) {
                for (const fileWord of filenameWords) {
                    if (titleWord === fileWord) {
                        matchScore += 2; // Exact word match
                    } else if (titleWord.includes(fileWord) || fileWord.includes(titleWord)) {
                        matchScore += 1; // Partial word match
                    }
                }
            }

            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatch = img.filename;
            }
        }

        if (bestMatch && bestMatchScore >= 2) {
            return bestMatch;
        }
    }

    // Fallback to hardcoded rules for legacy support
    const imageRules = [
        { match: 'ARAM SEI', image: 'ARAM SEI.jpg' },
        { match: 'ANDRADA UNAVU', image: 'ANDRADA UNAVU.jpg' },
        { match: 'HOLY MASS', image: 'HOLY MASS - ENGLISH.jpg' },
        { match: 'DIVINE MERCY ROSARY', image: 'DIVINE MERCY ROSARY.jpg' },
        { match: 'EDUTHU VAASI', image: 'EDUTHU VAASI.jpg' },
        { match: 'THIRUPUGAL MAALAI', image: 'THIRUPUGAL MAALAI.jpg' },
        { match: 'VAZHVU THARUM IRAIVARTHAI', image: 'VAZHVU THARUM IRAIVARTHAI.jpg' },
        { match: 'ARATHANAI', image: 'ADORATION.jpg' },
        { match: 'VANTHATHUM THANTHATHUM', image: 'VANTHADHUM THANTHADHUM.jpg' },
        { match: 'VATICAN TOP 10', image: 'VATICAN TOP 10.jpg' },
        { match: 'PAADI PUGAZHVOM', image: 'PAADI PUGAZHVOM.jpg' },
        { match: 'PRAISE AND WORSHIP', image: 'PRAISE AND WORSHIP.jpg' },
        { match: 'NALAMA NEENGA NALAMA', image: 'NALAMA NEENGA NALAMA.jpg' },
        { match: 'KATHAIKALAM VANGA', image: 'KATHAIKALAM VANGA.jpg' },
        { match: 'GOSPEL SINGER', image: 'GOSPEL SINGER.jpg' },
        { match: 'KADAVUL VANAKKAM', image: 'KADAVUL VANAKKAM.jpg' },
        { match: 'KADAVUL VANAKAM', image: 'KADAVUL VANAKKAM.jpg' },
        { match: 'GOODNIGHT TALK', image: 'GOOD NIGHT TALK.jpg' },
        { match: 'BESANT NAGAR', image: 'BESANT NAGAR.jpg' },
        { match: 'SACRED HEART ROSARY', image: 'SACRED HEART ROSARY.jpg' },
        { match: 'BROTHER ANAND', image: 'BROTHER ANAND.jpg' },
        { match: 'BROTHER SELVAM', image: 'BROTHER SELVAM.jpg' },
        { match: 'SUNDAY MASS', image: 'SUNDAY MASS.jpg' },
        { match: 'POTRI IRAIVA', image: 'POTRI IRAIVA.jpg' },
        { match: 'NILA MUTRAM', image: 'NILA MUTRAM.jpg' },
        { match: 'IRAIYATCHIYIN CHELLANGAL', image: 'IRAIYATCHIYIN CHELLANGAL.jpg' },
        { match: 'NEE NAMBINAL', image: 'NEE NAMBINAL.jpg' },
        { match: 'MARIYE VAZHGA', image: 'MARIYE VAZHGA.jpg' },
        { match: 'MARIAN HYMNS', image: 'MARIAN HYMNS.jpg' },
        { match: 'MADHA TALKIES', image: 'MADHA TALKIES.jpg' },
        { match: 'NARSEITHI MALARGAL', image: 'NARSEITHI MALARGAL.jpg' },
        { match: 'ELANGALAI POZHUTHIL', image: 'ELANGALAI POZHUTHIL.jpg' },
    ];

    for (const rule of imageRules) {
        if (normalizedTitle.includes(rule.match)) {
            return rule.image;
        }
    }

    // Default fallback image
    return 'madhatv.png';
};

/**
 * Bulk process programs to assign images
 * @param {Array} programs - Array of program objects
 * @returns {Array} - Programs with assigned images
 */
export const assignProgramImages = (programs) => {
    return programs.map(program => ({
        ...program,
        program_image: program.program_image || getProgramImage(program.title)
    }));
};

/**
 * Get image mapping report for debugging
 * @param {Array} programs - Array of program objects  
 * @returns {Object} - Report showing mapping results
 */
export const getImageMappingReport = (programs) => {
    const report = {
        total: programs.length,
        mapped: 0,
        defaultUsed: 0,
        mappings: {}
    };

    programs.forEach(program => {
        const assignedImage = getProgramImage(program.title);
        if (assignedImage === 'madhatv.png') {
            report.defaultUsed++;
        } else {
            report.mapped++;
        }
        
        if (!report.mappings[assignedImage]) {
            report.mappings[assignedImage] = [];
        }
        report.mappings[assignedImage].push(program.title);
    });

    return report;
};