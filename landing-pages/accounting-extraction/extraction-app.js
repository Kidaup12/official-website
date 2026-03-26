/**
 * Extraction App Logic - Enhanced Version
 */

const WEBHOOK_URL = 'https://taxautomation.app.n8n.cloud/webhook/extraction';

const state = {
    personCount: 1,
    maxPersons: 1,
    maxRowsPerSection: 3,
    uploadedFiles: []
};

// DOM Refs
let progressBar, progressText, statusOverlay, successOverlay, errorMsg;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('extractionForm');
    const personsContainer = document.getElementById('personsContainer');
    
    // Initialize DOM Refs
    statusOverlay = document.getElementById('status-overlay');
    successOverlay = document.getElementById('success-overlay');
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');
    errorMsg = document.getElementById('error-msg');

    // Initialize Person 1
    if (personsContainer) {
        personsContainer.innerHTML = createPersonCard(1);
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!hasAnyFiles()) {
                errorMsg.innerText = 'Please upload at least one document to proceed.';
                errorMsg.style.display = 'block';
                return;
            }

            errorMsg.style.display = 'none';
            statusOverlay.style.display = 'flex';
            animateProgress(60);

            const { formData, fileList } = await buildPayload();
            state.uploadedFiles = fileList;

            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const contentType = response.headers.get('content-type') || '';
                
                // Enhanced binary detection for XLSX and Excel streams
                const isBinaryType = contentType.includes('spreadsheetml') || 
                                     contentType.includes('excel') || 
                                     contentType.includes('xlsx') ||
                                     contentType.includes('octet-stream');

                if (isBinaryType) {
                    const blob = await response.blob();
                    await triggerDownload(blob, response.headers.get('content-disposition'), 'extracted_data.xlsx');
                    await renderDataPreview(blob);
                    showSuccess();
                } else {
                    // For everything else (json content-type, csv content-type, text, unknown)
                    // ALWAYS read as text first — never call response.json() directly
                    // because n8n may send csv text with application/json content-type
                    const text = await response.text();
                    
                    // Try JSON.parse — if it succeeds it's JSON, if it fails treat as CSV
                    let parsedJson = null;
                    try {
                        parsedJson = JSON.parse(text);
                    } catch {
                        parsedJson = null; // Not JSON — treat as CSV
                    }

                    if (parsedJson !== null) {
                        // It's valid JSON — check status
                        if (parsedJson.status === 'error') {
                            throw new Error(parsedJson.message || 'Processing failed');
                        }
                        // status:success, or any other JSON = show success
                        showSuccess();
                    } else {
                        // Not JSON — treat as CSV text
                        if (text && text.trim().length > 0) {
                            const blob = new Blob([text], { type: 'text/csv' });
                            await triggerDownload(blob, response.headers.get('content-disposition'), 'extracted_data.csv');
                            renderCsvPreview(text);
                            showSuccess();
                        } else {
                            showSuccess(); // Empty response — still mark as success
                        }
                    }
                }
            } catch (error) {
                console.error('Error during extraction:', error);
                statusOverlay.style.display = 'none';
                errorMsg.innerText = `Error: ${error.message}. Please try again.`;
                errorMsg.style.display = 'block';
            }
        });
    }
});

async function triggerDownload(blob, disposition, defaultFilename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let filename = defaultFilename;
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '').trim();
        }
    }
    // Always enforce the correct extension based on defaultFilename's extension
    const expectedExt = defaultFilename.includes('.xlsx') ? '.xlsx' : '.csv';
    if (!filename.toLowerCase().endsWith('.csv') && !filename.toLowerCase().endsWith('.xlsx')) {
        filename += expectedExt;
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

function renderCsvPreview(csvText) {
    try {
        const rows = csvText.trim().split('\n').map(row => {
            // basic CSV parsing - handle quoted fields
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
                if (row[i] === '"') {
                    inQuotes = !inQuotes;
                } else if (row[i] === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += row[i];
                }
            }
            result.push(current);
            return result;
        });

        if (rows.length === 0) return;

        const headers = rows[0];
        const dataRows = rows.slice(1);

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h.trim();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        dataRows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.trim();
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        const previewEl = document.getElementById('excel-preview');
        if (previewEl) {
            previewEl.innerHTML = '';
            previewEl.appendChild(table);
            document.getElementById('preview-container').style.display = 'block';
        }
    } catch (e) {
        console.warn('Could not render CSV preview:', e);
    }
}

async function buildPayload() {
    const formData = new FormData();
    const fileList = [];
    formData.append('submittedAt', new Date().toISOString());
    let fileIndex = 0;

    for (let pNum = 1; pNum <= state.personCount; pNum++) {
        ['paystub', 'k1', '1040'].forEach(docType => {
            const rows = document.querySelectorAll(`[id^="person${pNum}-${docType}-"][id$="-file"]`);
            rows.forEach((fileInput, rowIdx) => {
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const baseId = fileInput.id.replace('-file', '');
                    
                    let metadata = '';
                    const providerSel = document.getElementById(`${baseId}-provider`);
                    const typeSel = document.getElementById(`${baseId}-type`);
                    if (providerSel) metadata = providerSel.value;
                    if (typeSel) metadata = typeSel.value;

                    let fieldName = `person${pNum}_${docType}`;
                    if (metadata) {
                        const cleanMeta = metadata.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
                        fieldName += `_${cleanMeta}`;
                    }
                    fieldName += `_${rowIdx + 1}`;

                    formData.append(fieldName, file);
                    fileList.push(file.name);
                    fileIndex++;
                }
            });
        });
    }
    formData.append('totalFiles', fileIndex);
    return { formData, fileList };
}

async function renderDataPreview(blob) {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to HTML
        const html = XLSX.utils.sheet_to_html(worksheet);
        const previewEl = document.getElementById('excel-preview');
        if (previewEl) {
            previewEl.innerHTML = html;
            document.getElementById('preview-container').style.display = 'block';
        }
    } catch (e) {
        console.warn('Could not generate preview:', e);
    }
}

function animateProgress(duration) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        if (progress > 95) clearInterval(interval);
        progressBar.style.width = `${progress}%`;
        progressText.innerText = `${progress}%`;
    }, (duration * 1000) / 100);
    window.progressInterval = interval;
}

function showSuccess() {
    clearInterval(window.progressInterval);
    progressBar.style.width = '100%';
    progressText.innerText = '100%';

    // Update file list
    const fileListEl = document.getElementById('processed-file-list');
    if (fileListEl) {
        fileListEl.innerHTML = state.uploadedFiles.map(f => `<li>• ${f}</li>`).join('');
    }

    setTimeout(() => {
        statusOverlay.style.display = 'none';
        successOverlay.style.display = 'flex';
    }, 500);
}

function createDocumentRow(type, personIndex, rowIndex, showRemove = false) {
    const baseId = `person${personIndex}-${type}-${rowIndex}`;
    const needs1040 = type === '1040';
    const needsType = type === 'paystub' || type === 'k1';
    let dropdownHTML = '';

    if (type === 'paystub') {
        dropdownHTML = `
            <select id="${baseId}-provider" class="form-select" onchange="onTypeSelected('${baseId}', this)">
                <option value="">Select provider first...</option>
                <option value="ADP">ADP</option>
                <option value="Gusto">Gusto</option>
                <option value="Paychex">Paychex</option>
                <option value="QuickBooks">QuickBooks</option>
            </select>
        `;
    } else if (type === 'k1') {
        dropdownHTML = `
            <select id="${baseId}-type" class="form-select" onchange="onTypeSelected('${baseId}', this)">
                <option value="">Select K-1 type first...</option>
                <option value="Form 1065 Partnership">1065 Partnership</option>
                <option value="Form 1120-S S-Corp">1120-S S-Corp</option>
            </select>
        `;
    }

    const labelText = needs1040 ? 'Choose File (Pages 1–2)' : 'Choose File';
    // For paystub and k1, file starts locked until a type is selected
    const lockedClass = needsType ? 'locked' : '';
    const fileInputDisabled = needsType ? 'disabled' : '';

    const removeBtn = showRemove ? `
        <button type="button" class="btn-remove-row" onclick="removeDocumentRow('${type}', ${personIndex}, ${rowIndex})" title="Remove">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    ` : '';

    return `
        <div class="document-row" id="${baseId}-row">
            <div class="row-grid">
                ${dropdownHTML ? `
                <div class="row-top">
                    ${dropdownHTML}
                    ${removeBtn}
                </div>` : `<div class="row-top" style="justify-content:flex-end;">${removeBtn}</div>`}
                <div class="file-upload-wrapper">
                    <input type="file" id="${baseId}-file" class="file-upload-input" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv" ${fileInputDisabled} onchange="handleFileSelect(this)">
                    <label for="${baseId}-file" class="file-upload-label ${lockedClass}" id="${baseId}-label" ${needsType ? `onclick="checkTypeBeforeUpload(event, '${baseId}')"` : ''}>
                        <svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span class="file-label-text">${labelText}</span>
                    </label>
                    <div class="file-info" id="${baseId}-info" style="display:none; align-items:center; gap:8px; padding:6px 2px; font-size:12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48bb78" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span class="file-name" id="${baseId}-name" style="color:#276749; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></span>
                        <button type="button" class="btn-clear-file" onclick="clearFileSelection('${baseId}')">✕ Clear</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createDocumentSection(type, personIndex) {
    const sectionId = `person${personIndex}-${type}-section`;
    const titleMap = { 'paystub': 'Paystub', 'k1': 'K-1 Schedule', '1040': 'Prior Year 1040' };
    return `
        <div class="document-section" id="${sectionId}">
            <div class="document-header">
                <h3 class="document-title">${titleMap[type]}</h3>
                <span class="optional-tag">Optional</span>
            </div>
            <div id="${sectionId}-rows">
                ${createDocumentRow(type, personIndex, 1)}
            </div>
            <button type="button" class="btn-add-more" id="${sectionId}-add-btn" onclick="addDocumentRow('${type}', ${personIndex})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add another
            </button>
        </div>
    `;
}

function createPersonCard(personNumber) {
    return `
        <div class="person-card" id="person${personNumber}-card" style="box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div class="person-header">
                <h2 class="person-title"><span class="person-badge">${personNumber}</span> Document Suite</h2>
            </div>
            ${createDocumentSection('paystub', personNumber)}
            ${createDocumentSection('k1', personNumber)}
            ${createDocumentSection('1040', personNumber)}
        </div>
    `;
}

function handleFileSelect(input) {
    const baseId = input.id.replace('-file', '');
    const label = document.getElementById(`${baseId}-label`);
    const infoDiv = document.getElementById(`${baseId}-info`);
    const nameSpan = document.getElementById(`${baseId}-name`);
    if (input.files && input.files[0]) {
        nameSpan.textContent = input.files[0].name;
        infoDiv.style.display = 'flex';
        label.classList.add('file-selected');
        label.querySelector('.file-label-text').textContent = 'File selected';
        checkFormValidity();
    }
}

function onTypeSelected(baseId, selectEl) {
    const input = document.getElementById(`${baseId}-file`);
    const label = document.getElementById(`${baseId}-label`);
    if (selectEl.value && selectEl.value !== '') {
        // Unlock the file upload
        if (input) input.removeAttribute('disabled');
        if (label) {
            label.classList.remove('locked');
            label.removeAttribute('onclick');
        }
    } else {
        // Re-lock if they deselect back to blank
        if (input) input.setAttribute('disabled', '');
        if (label) label.classList.add('locked');
    }
}

function checkTypeBeforeUpload(event, baseId) {
    const type = baseId.split('-')[1];
    const providerSel = document.getElementById(`${baseId}-provider`);
    const typeSel = document.getElementById(`${baseId}-type`);
    const sel = providerSel || typeSel;
    if (sel && (!sel.value || sel.value === '')) {
        event.preventDefault();
        // Briefly highlight the dropdown to guide the user
        sel.style.borderColor = '#e53e3e';
        sel.style.boxShadow = '0 0 0 3px rgba(229,62,62,0.2)';
        sel.focus();
        setTimeout(() => {
            sel.style.borderColor = '';
            sel.style.boxShadow = '';
        }, 2000);
    }
}

function checkFormValidity() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = !hasAnyFiles();
    }
}

function hasAnyFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
        if (input.files && input.files.length > 0) return true;
    }
    return false;
}

function clearFileSelection(baseId) {
    const input = document.getElementById(`${baseId}-file`);
    const label = document.getElementById(`${baseId}-label`);
    const infoDiv = document.getElementById(`${baseId}-info`);
    const type = baseId.split('-')[1];
    const labelText = type === '1040' ? 'Pages 1-2' : 'Choose File';
    
    if (input) input.value = '';
    if (infoDiv) infoDiv.style.display = 'none';
    if (label) {
        label.classList.remove('file-selected');
        label.querySelector('.file-label-text').textContent = labelText;
    }
    checkFormValidity();
}

function addDocumentRow(type, personIndex) {
    const rowsContainer = document.getElementById(`person${personIndex}-${type}-section-rows`);
    const currentRows = rowsContainer.children.length;
    if (currentRows >= state.maxRowsPerSection) return;
    const newIdx = currentRows + 1;
    rowsContainer.insertAdjacentHTML('beforeend', createDocumentRow(type, personIndex, newIdx, true));
    if (newIdx >= state.maxRowsPerSection) {
        document.getElementById(`person${personIndex}-${type}-section-add-btn`).style.display = 'none';
    }
}

function removeDocumentRow(type, personIndex, rowIndex) {
    const row = document.getElementById(`person${personIndex}-${type}-${rowIndex}-row`);
    if (row) {
        row.remove();
        document.getElementById(`person${personIndex}-${type}-section-add-btn`).style.display = 'inline-flex';
        checkFormValidity();
    }
}
