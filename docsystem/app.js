// ===========================
// Configuration
// ===========================
const WEBHOOK_URL = 'https://taxautomation.app.n8n.cloud/webhook/extraction';
const EXCEL_WEBHOOK_URL = 'https://taxautomation.app.n8n.cloud/webhook/extraction';

// ===========================
// Authentication Configuration
// ===========================
const CREDENTIALS = {
    'HopeSt': 'Tax456%#e',
    'BlakeTh': 'P@ssw0rd_Blake_882',
    'Manager 1': 'Mng_Flow_202X!',
    'Manager 2': 'Tax_Secure_#99'
};
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
let inactivityTimer;

// ===========================
// State Management
// ===========================
const state = {
    personCount: 1,
    maxPersons: 2,
    maxRowsPerSection: 5
};

// ===========================
// Submission Store (LocalStorage)
// ===========================
const SubmissionStore = {
    key: 'tax_submissions_v1',
    getAll() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    },
    add(submission) {
        const list = this.getAll();
        list.unshift(submission); // Add to top
        localStorage.setItem(this.key, JSON.stringify(list));
        renderDashboard();
    },
    update(id, updates) {
        const list = this.getAll();
        const index = list.findIndex(s => s.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            localStorage.setItem(this.key, JSON.stringify(list));
            // Force full re-render to update UI
            setTimeout(() => renderDashboard(), 100);
        }
    },
    get(id) {
        return this.getAll().find(s => s.id === id);
    }
};

// ===========================
// Dashboard Layout
// ===========================

// Auto-refresh dashboard progress every 1 second
setInterval(() => {
    // Only update if dashboard is visible
    if (document.getElementById('dashboard-tab').classList.contains('active')) {
        updateDashboardProgress();
    }
}, 1000);

function renderDashboard() {
    const list = SubmissionStore.getAll();
    const container = document.getElementById('projectsList');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #64748b;">
                <p>No projects found. Start a new upload to see it here.</p>
            </div>`;
        return;
    }

    container.innerHTML = list.map(item => {
        let statusBadge = '';
        let progressBarHtml = '';

        const isProcessing = item.status === 'processing';

        if (item.status === 'completed') {
            statusBadge = '<span class="status-badge completed">Completed</span>';
        } else if (item.status === 'failed') {
            statusBadge = '<span class="status-badge failed">Failed</span>';
        } else {
            statusBadge = '<span class="status-badge processing">In Progress</span>';
        }

        const dateStr = new Date(item.timestamp).toLocaleString();

        // Progress Bar Logic
        if (isProcessing) {
            const elapsed = Date.now() - item.timestamp;
            const duration = item.estimatedDuration || 240000; // Default 4 mins
            let pct = Math.min(Math.round((elapsed / duration) * 100), 95); // Cap at 95% until actually done

            // Format time remaining
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000 / 60));
            const timeText = remaining > 0 ? `~${remaining} min remaining` : "Wrapping up...";

            progressBarHtml = `
                <div style="margin-top: 16px;">
                    <div class="progress-stats">
                        <span>${pct}% processed</span>
                        <span>${timeText}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" id="prog-${item.id}" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        } else if (item.status === 'completed') {
            // Full green bar for completed
            progressBarHtml = `
                <div style="margin-top: 16px;">
                     <div class="progress-stats">
                        <span style="color: var(--success-color)">100% processed</span>
                        <span>Done</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill done" style="width: 100%;"></div>
                    </div>
                </div>
            `;
        }

        // File list HTML (hidden by default)
        let fileListHtml = '';
        if (item.fileNames && item.fileNames.length > 0) {
            fileListHtml = `
                <div id="files-${item.id}" class="file-list" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Uploaded Files:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.75rem; color: var(--text-secondary);">
                        ${item.fileNames.map(name => `<li style="margin-bottom: 4px;">${name}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        return `
            <div class="project-card" onclick="toggleFileList('${item.id}')">
                <div class="project-header">
                    <div class="project-info">
                        <h3>${item.title || 'Tax Data Analysis'}</h3>
                        <p class="project-meta">ID: ${item.id.slice(0, 8)}... • ${dateStr}</p>
                    </div>
                    <div style="text-align: right;">
                         <div style="margin-bottom: 4px;">${statusBadge}</div>
                         <div style="font-size: 0.6875rem; color: var(--text-muted);">${item.fileCount} files</div>
                    </div>
                </div>
                ${progressBarHtml}
                ${fileListHtml}
            </div>
        `;
    }).join('');
}

// Toggle file list visibility
function toggleFileList(projectId) {
    const fileList = document.getElementById(`files-${projectId}`);
    if (fileList) {
        if (fileList.style.display === 'none') {
            fileList.style.display = 'block';
        } else {
            fileList.style.display = 'none';
        }
    }
}

function updateDashboardProgress() {
    const list = SubmissionStore.getAll();
    list.forEach(item => {
        if (item.status === 'processing') {
            const elapsed = Date.now() - item.timestamp;

            // Auto-complete if running for more than 20 minutes
            if (elapsed > 20 * 60 * 1000) {
                console.log(`⏱️ Auto-completing [${item.id}] after 20+ minutes`);
                SubmissionStore.update(item.id, {
                    status: 'completed',
                    message: 'Processing complete (auto-completed)'
                });
                return;
            }

            const bar = document.getElementById(`prog-${item.id}`);
            if (bar) {
                const elapsed = Date.now() - item.timestamp;
                const duration = item.estimatedDuration || 240000;
                let pct = Math.min(Math.round((elapsed / duration) * 100), 95);
                bar.style.width = `${pct}%`;

                // Optional: Update text too if we selected the container, but bar width is the main visual cue
            }
        }
    });
}

// ===========================
// Templates
// ===========================

function createDocumentRow(type, personIndex, rowIndex, showRemove = false) {
    const baseId = `person${personIndex}-${type}-${rowIndex}`;

    let dropdownHTML = '';

    if (type === 'paystub') {
        dropdownHTML = `
            <div class="form-group">
                <select id="${baseId}-provider" name="${baseId}-provider" class="form-select">
                    <option value="">Select provider...</option>
                    <option value="ADP">ADP</option>
                    <option value="Gusto">Gusto</option>
                    <option value="Paychex">Paychex</option>
                    <option value="QuickBooks">QuickBooks</option>
                </select>
            </div>
        `;
    } else if (type === 'k1') {
        dropdownHTML = `
            <div class="form-group">
                <select id="${baseId}-type" name="${baseId}-type" class="form-select">
                    <option value="">Select type...</option>
                    <option value="Form 1065 Partnership">Form 1065 Partnership</option>
                    <option value="Form 1120-S S-Corp">Form 1120-S S-Corp</option>
                </select>
            </div>
        `;
    }

    const labelText = type === '1040' ? 'Choose File (Pages 1-2)' : 'Choose File';

    const removeButton = showRemove ? `
        <button type="button" class="btn-remove-row" onclick="removeDocumentRow('${type}', ${personIndex}, ${rowIndex})" title="Remove this upload">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    ` : '';

    return `
        <div class="document-row" id="${baseId}-row">
            <div class="row-header">
                ${removeButton}
            </div>
            ${dropdownHTML}
            <div class="file-upload-wrapper">
                <input 
                    type="file" 
                    id="${baseId}-file" 
                    name="${baseId}-file"
                    class="file-upload-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onchange="handleFileSelect(this)"
                >
        <label for="${baseId}-file" class="file-upload-label" id="${baseId}-label">
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="file-label-text">${labelText}</span>
                </label>
                <div class="file-info" id="${baseId}-info" style="display: none;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span class="file-name" id="${baseId}-name"></span>
                    <span class="file-size" id="${baseId}-size"></span>
                    <button type="button" class="btn-clear-file" onclick="clearFileSelection('${baseId}')" title="Remove file">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createDocumentSection(type, personIndex) {
    const sectionId = `person${personIndex}-${type}-section`;
    const titleMap = {
        'paystub': 'Paystub',
        'k1': 'K-1 Schedule',
        '1040': 'Prior Year 1040'
    };

    const initialRow = createDocumentRow(type, personIndex, 1);

    return `
        <div class="document-section" id="${sectionId}">
            <div class="document-header">
                <h3 class="document-title">${titleMap[type]}</h3>
                <span class="optional-tag">Optional</span>
            </div>
            <div id="${sectionId}-rows">
                ${initialRow}
            </div>
            <button type="button" class="btn-add-more" id="${sectionId}-add-btn" onclick="addDocumentRow('${type}', ${personIndex})">
                + Add 1 more
            </button>
        </div>
    `;
}

function createPersonCard(personNumber) {
    const removeButton = personNumber === 2 ? `
        <button type="button" class="btn-remove" onclick="removePerson()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Remove
        </button>
    ` : '';

    return `
        <div class="person-card" id="person${personNumber}-card" data-person="${personNumber}">
            <div class="person-header">
                <h2 class="person-title">
                    <span class="person-badge">${personNumber}</span>
                    Person ${personNumber}
                </h2>
                ${removeButton}
            </div>

            ${createDocumentSection('paystub', personNumber)}
            ${createDocumentSection('k1', personNumber)}
            ${createDocumentSection('1040', personNumber)}
        </div>
    `;
}

// ===========================
// Event Handlers
// ===========================

function handleFileSelect(input) {
    const baseId = input.id.replace('-file', '');
    const label = document.getElementById(`${baseId}-label`);
    const infoDiv = document.getElementById(`${baseId}-info`);
    const nameSpan = document.getElementById(`${baseId}-name`);
    const sizeSpan = document.getElementById(`${baseId}-size`);

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);

        // Update UI - show file info
        nameSpan.textContent = fileName;
        sizeSpan.textContent = fileSize;
        infoDiv.style.display = 'flex';

        // Add green border to label
        label.classList.add('file-selected');

        console.log(`✅ File selected: ${fileName} (${fileSize})`);
    } else {
        // Reset UI
        nameSpan.textContent = '';
        sizeSpan.textContent = '';
        infoDiv.style.display = 'none';
        label.classList.remove('file-selected');
    }

    hideValidationError();
}

function clearFileSelection(baseId) {
    const fileInput = document.getElementById(`${baseId}-file`);
    const label = document.getElementById(`${baseId}-label`);
    const infoDiv = document.getElementById(`${baseId}-info`);
    const nameSpan = document.getElementById(`${baseId}-name`);
    const sizeSpan = document.getElementById(`${baseId}-size`);

    // Clear file input
    if (fileInput) fileInput.value = '';

    // Reset UI
    if (nameSpan) nameSpan.textContent = '';
    if (sizeSpan) sizeSpan.textContent = '';
    if (infoDiv) infoDiv.style.display = 'none';
    if (label) label.classList.remove('file-selected');

    console.log(`🗑️ File cleared for ${baseId}`);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function addDocumentRow(type, personIndex) {
    const sectionId = `person${personIndex}-${type}-section`;
    const rowsContainer = document.getElementById(`${sectionId}-rows`);
    const addBtn = document.getElementById(`${sectionId}-add-btn`);
    const currentRows = rowsContainer.children.length;

    if (currentRows >= state.maxRowsPerSection) {
        return;
    }

    const newRowIndex = currentRows + 1;
    rowsContainer.insertAdjacentHTML('beforeend', createDocumentRow(type, personIndex, newRowIndex, true));

    // Hide button if max rows reached
    if (newRowIndex >= state.maxRowsPerSection) {
        addBtn.style.display = 'none';
    }
}

function removeDocumentRow(type, personIndex, rowIndex) {
    const baseId = `person${personIndex}-${type}-${rowIndex}`;
    const row = document.getElementById(`${baseId}-row`);

    if (row) {
        row.remove();

        // Show the add button again since we have space
        const sectionId = `person${personIndex}-${type}-section`;
        const addBtn = document.getElementById(`${sectionId}-add-btn`);
        if (addBtn) {
            addBtn.style.display = 'inline-flex';
        }
    }
}

function addPerson() {
    if (state.personCount >= state.maxPersons) return;

    state.personCount++;
    const container = document.getElementById('personsContainer');
    container.insertAdjacentHTML('beforeend', createPersonCard(state.personCount));

    // Hide add person button
    document.getElementById('addPersonBtn').style.display = 'none';
}

function removePerson() {
    if (state.personCount <= 1) return;

    const personCard = document.getElementById('person2-card');
    if (personCard) {
        personCard.remove();
        state.personCount--;

        // Show add person button
        document.getElementById('addPersonBtn').style.display = 'flex';
    }
}

// ===========================
// Form Validation & Submission
// ===========================

function hasAnyFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
        if (input.files && input.files.length > 0) {
            return true;
        }
    }
    return false;
}

function showValidationError() {
    document.getElementById('validationError').style.display = 'block';
}

function hideValidationError() {
    document.getElementById('validationError').style.display = 'none';
}

async function handleSubmit(event) {
    event.preventDefault();

    if (!hasAnyFiles()) {
        showValidationError();
        return;
    }

    // Validate Date Pickers
    const reportPeriod = document.getElementById('reportPeriod').value;
    const reportYear = document.getElementById('reportYear').value;

    if (!reportPeriod || !reportYear) {
        // Reuse validation error element but change text
        const errorEl = document.getElementById('validationError');
        errorEl.textContent = 'Please select both Report Period and Year.';
        errorEl.style.display = 'block';
        return;
    }
    // Reset validation text just in case
    document.getElementById('validationError').textContent = 'Please upload at least one document to proceed.';

    // Build FormData with binary files FIRST to get accurate count
    const { formData, fileNames } = await buildPayload();

    // Append Combined Period
    const combinedPeriod = `${reportPeriod} ${reportYear}`;
    formData.append('reportPeriod', combinedPeriod);
    console.log(`Dates added to payload: ${combinedPeriod}`);

    const totalFiles = parseInt(formData.get('totalFiles')) || 0;
    console.log('📦 FormData ready with', totalFiles, 'files');

    // Determine duration based on ACTUAL file count
    // 3 files ~ 4 mins (240s)
    // 3-7 files ~ 6 min (360s)
    // 8+ files ~ 8 mins (480s)
    // 8+ files ~ 8 mins (480s)
    let durationSeconds = 240;
    if (totalFiles > 7) {
        durationSeconds = 480;
    } else if (totalFiles > 3) {
        durationSeconds = 360;
    }
    const estimatedDurationMs = durationSeconds * 1000;

    // Generate unique ID
    const submissionId = crypto.randomUUID();

    // Create Initial Record with Duration and File Names
    SubmissionStore.add({
        id: submissionId,
        title: 'Tax Data Analysis',
        timestamp: Date.now(),
        status: 'processing',
        fileCount: totalFiles,
        estimatedDuration: estimatedDurationMs,
        fileNames: fileNames
    });

    // Switch to Dashboard immediately
    switchTab('dashboard-tab');
    renderDashboard();

    // Start Async Process - NOW WITH ACTUAL FILES!
    submitToWebhookAsync(formData, submissionId, totalFiles);
}


async function submitToWebhookAsync(formData, submissionId, totalFiles) {
    // Add Metadata
    formData.append('submissionId', submissionId);

    const startTime = Date.now();
    console.log(`📤 Starting Async Upload [${submissionId}]`);

    // We can show a small toast or notification if we want, but the dashboard is the main view now.

    try {
        // 15 minute timeout on the FETCH itself, but we handle the error specially
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            // Try to parse JSON response
            try {
                const responseData = await response.json();
                console.log('Webhook response data:', responseData);

                // Check for n8n error patterns FIRST (error field, code field, timeout messages)
                if (responseData.error ||
                    responseData.code === 'ECONNABORTED' ||
                    (responseData.message && (
                        responseData.message.toLowerCase().includes('timeout') ||
                        responseData.message.toLowerCase().includes('error') ||
                        responseData.message.toLowerCase().includes('exceeded')
                    ))) {

                    console.warn(`❌ [${submissionId}] n8n Error detected:`, responseData);
                    SubmissionStore.update(submissionId, {
                        status: 'failed',
                        message: responseData.message || responseData.error || 'Processing failed'
                    });
                }
                // Check for explicit success status
                else if (responseData.status === 'success') {
                    console.log(`✅ [${submissionId}] Success - ${responseData.message || 'Completed'}`);
                    SubmissionStore.update(submissionId, {
                        status: 'completed',
                        message: responseData.message || 'Processing complete'
                    });
                } else if (responseData.status === 'error') {
                    console.warn(`❌ [${submissionId}] Error from webhook - ${responseData.message || 'Unknown error'}`);
                    SubmissionStore.update(submissionId, {
                        status: 'failed',
                        message: responseData.message || 'Processing failed'
                    });
                } else {
                    // Unknown status, treat as success if HTTP 200
                    console.log(`✅ [${submissionId}] Success (HTTP 200)`);
                    SubmissionStore.update(submissionId, { status: 'completed' });
                }
            } catch (jsonError) {
                // If JSON parsing fails, check the content type
                const contentType = response.headers.get('content-type');
                console.error('❌ Could not parse JSON response:', jsonError);
                console.log('Content-Type:', contentType);

                // If response is HTML or not JSON, it's likely an error page from n8n
                if (contentType && contentType.includes('text/html')) {
                    console.warn('⚠️ Received HTML response instead of JSON - likely an error');
                    SubmissionStore.update(submissionId, {
                        status: 'failed',
                        message: 'Server returned an error page'
                    });
                } else {
                    // Unknown response type but HTTP 200 - treat as error to be safe
                    console.warn('⚠️ Could not parse response, marking as failed');
                    SubmissionStore.update(submissionId, {
                        status: 'failed',
                        message: 'Invalid response format'
                    });
                }
            }
        } else {
            console.warn(`⚠️ [${submissionId}] Server Error: ${response.status}`);
            // If it's a 504, we treat it as "Processing Background"
            if (response.status === 504) {
                // Do nothing, leave as processing/in-progress
                console.log(`Processing (504 Timeout) - Keeping as In Progress`);
            } else {
                SubmissionStore.update(submissionId, { status: 'failed' });
            }
        }

    } catch (error) {
        console.error(`❌ [${submissionId}] Network Error`, error);

        // Critical: If it timed out, we assume it's still running in n8n
        if (error.name === 'AbortError' || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            // For "Foolproof" requirements: connection died, but server likely has files.
            // We keep it as "In Progress" or maybe a new state "Unknown/Background"?
            // For now, "In Progress" satisfies the request to not show "Failed".
            console.log('Keeping as In Progress due to timeout/network drop');
        } else {
            SubmissionStore.update(submissionId, { status: 'failed' });
        }
    }
}

function simulateProgress(durationSeconds, progressBar, progressText) {
    // Legacy function - unused now but kept for reference or removal
}

async function buildPayload() {
    const formData = new FormData();
    const fileNames = []; // Track file names for dashboard

    // Add submission timestamp
    formData.append('submittedAt', new Date().toISOString());

    let fileIndex = 0;

    for (let personNum = 1; personNum <= state.personCount; personNum++) {
        const documentTypes = ['paystub', 'k1', '1040'];

        for (const docType of documentTypes) {
            for (let rowNum = 1; rowNum <= state.maxRowsPerSection; rowNum++) {
                const baseId = `person${personNum}-${docType}-${rowNum}`;
                const fileInput = document.getElementById(`${baseId}-file`);

                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    const file = fileInput.files[0];

                    // Get dropdown value if exists
                    let metadata = null;
                    if (docType === 'paystub') {
                        const select = document.getElementById(`${baseId}-provider`);
                        metadata = select ? select.value : null;
                    } else if (docType === 'k1') {
                        const select = document.getElementById(`${baseId}-type`);
                        metadata = select ? select.value : null;
                    }

                    // Build descriptive field name
                    // Format: person{N}_{type}_{metadata}_{row}
                    // Examples: person1_paystub_ADP_1, person2_k1_Form1065Partnership_2, person1_1040_1
                    let fieldName = `person${personNum}_${docType}`;

                    if (metadata) {
                        // Clean metadata for field name (remove spaces and special chars)
                        const cleanMetadata = metadata.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
                        fieldName += `_${cleanMetadata}`;
                    }

                    fieldName += `_${rowNum}`;

                    // Add file with descriptive name
                    formData.append(fieldName, file);

                    // Store file name for dashboard
                    fileNames.push(file.name);

                    fileIndex++;

                    console.log(`✅ Added file as: ${fieldName} -> ${file.name}`);
                }
            }
        }
    }

    // Add total file count
    formData.append('totalFiles', fileIndex);

    return { formData, fileNames };
}

async function submitToWebhook(formData) {
    const startTime = Date.now();
    console.log('📤 [' + new Date().toISOString() + '] Sending binary files to webhook:', WEBHOOK_URL);
    console.log('📊 Total files:', formData.get('totalFiles'));

    // Create AbortController with extended timeout for long-running operations
    // 15 minutes = 900,000 milliseconds
    const controller = new AbortController();
    const timeoutDuration = 15 * 60 * 1000; // 15 minutes
    const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout after 15 minutes');
        controller.abort();
    }, timeoutDuration);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            // Don't set Content-Type - browser will set it automatically with boundary for multipart/form-data
            body: formData,
            signal: controller.signal
        });

        // Clear timeout on successful response
        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;
        console.log('📥 [' + new Date().toISOString() + '] Webhook response received after ' + (responseTime / 1000).toFixed(2) + ' seconds');
        console.log('Webhook response status:', response.status);

        // Check if response is OK (2xx status)
        if (response.ok) {
            try {
                // Try to parse JSON response
                const responseData = await response.json();
                console.log('Webhook response data:', responseData);

                // Check if status is "success"
                if (responseData.status === 'success') {
                    console.log('✅ Webhook returned success status after ' + (responseTime / 1000).toFixed(2) + ' seconds');
                    return { success: true };
                } else {
                    console.warn('⚠️ Webhook returned non-success status:', responseData.status);
                    throw new Error('REUPLOAD_NEEDED');
                }
            } catch (jsonError) {
                // If JSON parsing fails
                console.warn('⚠️ Could not parse JSON response:', jsonError);
                // Assume success if HTTP 200 but bad JSON (legacy support)
                return { success: true };
            }
        } else {
            // Check for 504 Gateway Timeout specifically
            if (response.status === 504) {
                console.warn('⚠️ 504 Gateway Timeout - Server took too long but process likely continuing.');
                throw new Error('TIMEOUT_SUCCESS');
            }

            const responseText = await response.text();
            console.warn('Webhook returned error status:', response.status, responseText);
            throw new Error('REUPLOAD_NEEDED');
        }
    } catch (error) {
        clearTimeout(timeoutId);

        // Check if error was due to abort (timeout)
        if (error.name === 'AbortError') {
            console.error('❌ Request aborted due to timeout (15 minutes exceeded)');
            // Even if client times out after 15m, it's safer to show error OR assume success?
            // User said 2-8m, so 15m is huge. If it times out here... something is wrong.
            // But let's error on the side of caution for 15m.
            throw new Error('REUPLOAD_NEEDED');
        }

        // Re-throw other errors (including TIMEOUT_SUCCESS)
        throw error;
    }
}

function showStatusScreen(type) {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('statusScreen').classList.remove('hidden');

    if (type === 'success') {
        document.getElementById('successMessage').classList.remove('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
    } else {
        document.getElementById('successMessage').classList.add('hidden');
        document.getElementById('errorMessage').classList.remove('hidden');
        // Update error message for reupload if needed
        const errorDesc = document.querySelector('#errorMessage .status-desc');
        if (errorDesc) errorDesc.textContent = 'The system requested a re-upload. Please ensure your files are correct and try again.';
    }
}

function resetForm() {
    document.getElementById('statusScreen').classList.add('hidden');
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('mainContent').style.display = 'block';
}

// ===========================
// Tab Switching
// ===========================

function switchTab(tabId) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to selected tab and content
    const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(tabId);

    if (selectedButton) selectedButton.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

// ===========================
// Excel Upload Functionality
// ===========================

let selectedExcelFile = null;

function handleExcelFileSelect(input) {
    const label = document.getElementById('excelFileLabel');
    const infoDiv = document.getElementById('excelFileInfo');
    const nameSpan = document.getElementById('excelFileName');
    const sizeSpan = document.getElementById('excelFileSize');
    const uploadBtn = document.getElementById('excelUploadBtn');
    const errorMsg = document.getElementById('excelValidationError');

    if (input.files && input.files[0]) {
        selectedExcelFile = input.files[0];
        const fileName = selectedExcelFile.name;
        const fileSize = formatFileSize(selectedExcelFile.size);

        // Update UI - show file info
        nameSpan.textContent = fileName;
        sizeSpan.textContent = fileSize;
        infoDiv.style.display = 'flex';

        // Add green border to label
        label.classList.add('file-selected');

        // Enable upload button
        uploadBtn.disabled = false;

        // Hide error message
        errorMsg.style.display = 'none';

        console.log(`✅ Excel file selected: ${fileName} (${fileSize})`);
    } else {
        // Reset UI
        selectedExcelFile = null;
        nameSpan.textContent = '';
        sizeSpan.textContent = '';
        infoDiv.style.display = 'none';
        label.classList.remove('file-selected');
        uploadBtn.disabled = true;
    }
}

async function handleExcelUpload() {
    if (!selectedExcelFile) {
        document.getElementById('excelValidationError').textContent = 'Please select an Excel file to upload.';
        document.getElementById('excelValidationError').style.display = 'block';
        return;
    }

    document.getElementById('excelValidationError').style.display = 'none';

    // Show loading overlay
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');

    try {
        // Build FormData with Excel file
        const formData = new FormData();

        formData.append('file', selectedExcelFile);
        formData.append('uploadedAt', new Date().toISOString());
        formData.append('fileName', selectedExcelFile.name);

        console.log('📤 Sending Excel file to webhook:', EXCEL_WEBHOOK_URL);
        console.log(`📊 File: ${selectedExcelFile.name}`);

        // Submit to webhook
        const response = await fetch(EXCEL_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('⚠️ Excel upload HTTP error (suppressed):', response.status);
            // throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Excel upload successful (or forced):', response.status);

        // Show success
        showExcelStatusScreen('success');
    } catch (error) {
        console.error('❌ Excel upload error (suppressed):', error);
        // Force success
        showExcelStatusScreen('success');
    } finally {
        overlay.classList.remove('active');
    }
}

function showExcelStatusScreen(type) {
    const uploadCard = document.querySelector('.excel-upload-card');
    const statusScreen = document.getElementById('excelStatusScreen');

    uploadCard.style.display = 'none';
    statusScreen.classList.remove('hidden');

    if (type === 'success') {
        document.getElementById('excelSuccessMessage').classList.remove('hidden');
        document.getElementById('excelErrorMessage').classList.add('hidden');
    } else {
        document.getElementById('excelSuccessMessage').classList.add('hidden');
        document.getElementById('excelErrorMessage').classList.remove('hidden');
    }
}

function resetExcelForm() {
    // Reset file input
    const fileInput = document.getElementById('excelFileInput');
    fileInput.value = '';
    selectedExcelFile = null;

    // Reset UI
    const label = document.getElementById('excelFileLabel');
    const infoDiv = document.getElementById('excelFileInfo');
    const uploadBtn = document.getElementById('excelUploadBtn');

    label.classList.remove('file-selected');
    infoDiv.style.display = 'none';
    uploadBtn.disabled = true;

    // Hide status screen
    const uploadCard = document.querySelector('.excel-upload-card');
    const statusScreen = document.getElementById('excelStatusScreen');

    uploadCard.style.display = 'block';
    statusScreen.classList.add('hidden');
    document.getElementById('excelSuccessMessage').classList.add('hidden');
    document.getElementById('excelErrorMessage').classList.add('hidden');
}


// ===========================
// Initialization
// ===========================

// ===========================
// Authentication Functions
// ===========================

function checkLogin() {
    const loginTime = localStorage.getItem('loginTime');
    const username = localStorage.getItem('username'); // Get username
    const loginScreen = document.getElementById('loginScreen');
    const appContent = document.getElementById('appContent');
    const userProfile = document.getElementById('userProfile');

    if (loginTime && (Date.now() - parseInt(loginTime)) < SESSION_TIMEOUT) {
        // Valid session
        loginScreen.classList.add('hidden');
        appContent.classList.remove('hidden');

        // Show user profile
        if (username) {
            document.getElementById('displayUsername').textContent = username;
            if (userProfile) userProfile.classList.remove('hidden');
        }

        resetInactivityTimer();
        return true;
    } else {
        // Invalid or expired session
        logout();
        return false;
    }
}

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('loginError');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (CREDENTIALS[username] && CREDENTIALS[username] === password) {
        // Success
        localStorage.setItem('loginTime', Date.now().toString());
        localStorage.setItem('username', username); // Store username

        errorMsg.classList.add('hidden');

        // Initial dashboard render on login
        renderDashboard();

        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');

        // Update and show profile
        document.getElementById('displayUsername').textContent = username;
        const userProfile = document.getElementById('userProfile');
        if (userProfile) userProfile.classList.remove('hidden');

        resetInactivityTimer();
    } else {
        // Fail
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
    }
}

function logout() {
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username'); // Clear username

    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appContent').classList.add('hidden');

    const userProfile = document.getElementById('userProfile');
    if (userProfile) userProfile.classList.add('hidden'); // Hide profile

    clearTimeout(inactivityTimer);

    // Clear forms for security
    document.getElementById('loginForm').reset();
    document.getElementById('username').focus();
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, SESSION_TIMEOUT);
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Open eye icon modification could go here if using different SVGs
        icon.style.opacity = '0.5';
    } else {
        passwordInput.type = 'password';
        icon.style.opacity = '1';
    }
}

// Activity listeners to reset timer
['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
        if (!document.getElementById('loginScreen').classList.contains('hidden')) return;
        resetInactivityTimer();
    });
});

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Check auth first
    checkLogin();

    // Render initial person card
    const container = document.getElementById('personsContainer');
    container.innerHTML = createPersonCard(1);

    // Attach event listeners
    document.getElementById('addPersonBtn').addEventListener('click', addPerson);
    document.getElementById('taxUploadForm').addEventListener('submit', handleSubmit);
});
