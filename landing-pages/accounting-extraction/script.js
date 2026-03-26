document.addEventListener('DOMContentLoaded', () => {
    // Capacity Calculator Logic
    const juniorsInput = document.getElementById('juniors-count');
    const hoursInput = document.getElementById('hours-per-week');
    const weeksInput = document.getElementById('busy-weeks');
    const costInput = document.getElementById('hourly-cost');
    
    const annualCostOutput = document.getElementById('annual-cost');
    const hoursSavedOutput = document.getElementById('hours-saved');
    const revenueOutput = document.getElementById('potential-revenue');

    function calculate() {
        const juniors = parseFloat(juniorsInput.value) || 0;
        const hours = parseFloat(hoursInput.value) || 0;
        const weeks = parseFloat(weeksInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;

        // Calculations
        const annualCost = juniors * hours * weeks * cost;
        const totalHours = juniors * hours * weeks;
        
        // Potential revenue: 3-4 clients per staff member, $5k-$8k per client
        // Average: 3.5 clients * $6,500 = $22,750 per junior staff member
        // But the prompt says "$15k Minimum" for the example given.
        // Let's use the prompt's logic: 3-4 more clients * $5k-$8k = $15k - $32k
        const minRevenue = Math.max(15000, juniors * 15000); 

        // Update UI
        annualCostOutput.innerText = `$${annualCost.toLocaleString()}`;
        hoursSavedOutput.innerText = `${totalHours.toLocaleString()}`;
        revenueOutput.innerText = `$${minRevenue.toLocaleString()}`;
    }

    // Add listeners
    [juniorsInput, hoursInput, weeksInput, costInput].forEach(input => {
        if (input) input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu (if needed, copying from main site)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});
