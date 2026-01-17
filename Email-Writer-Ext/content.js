console.log("Email Writer Assistance!");

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL ', // Gmail email body selector
        // '.ii.gt',   // Another possible Gmail email body selector
        'gmail_quote', // Gmail quoted text selector
        '[role="presentation"]' // General textbox role
    ];

    for (const selector of selectors) {  // ✅ Fixed: lowercase 's'
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText;
        }
    }
    return '';  // ✅ Fixed: moved outside loop
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];  // ✅ Fixed: lowercase 's'
    for (const selector of selectors) {  // ✅ Fixed: lowercase 's'
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;  // ✅ Fixed: moved outside loop
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerText = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) {
        existingButton.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Compose toolbar not found.");
        return;
    }

    console.log("Compose toolbar found:");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: 'professional',
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const generatedReply = await response.text();

            const composeBox = document.querySelector(
                '[role="textbox"][g_editable="true"]'
            );
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }

        } catch (error) {
            console.error('Error generating reply:', error);  // ✅ Added error logging
            alert('Failed to generate reply. Please try again.');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElement = addedNodes.some(
            (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.matches('.aDh, .btC, [role="dialog"]') ||
                    node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElement) {
            console.log("Compose email element detected!");
            setTimeout(injectButton, 1000);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});