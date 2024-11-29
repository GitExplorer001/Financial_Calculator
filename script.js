$(document).ready(function () {
  /*** EMI Calculator Functionality ***/
  $('#emi-calculate').click(function () {
    let principal = parseFloat($('#emi-principal').val()) || 0;
    let rate = parseFloat($('#emi-rate').val()) || 0;
    let time = parseFloat($('#emi-time').val()) || 0;
    let emi = parseFloat($('#emi-amount').val()) || 0;
    let timeUnit = $('#emi-time-unit').val();
    console.log(principal, rate, time, emi);
    $('#emi-time-circle').text("Monthly");

    if (timeUnit === 'years') {
        time *= 12; // Convert years to months
    } else if (timeUnit === 'weeks') {
        time /= 4.345; // Convert weeks to months
        $('#emi-time-circle').text("Weekly");
    }
    if (principal && rate && time && !emi) {
        // EMI Calculation (Principal, Rate and Time are known, calculate EMI)
        const monthlyRate = rate / (12 * 100);
        emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, time)) / (Math.pow(1 + monthlyRate, time) - 1);

        $('#emi-amount').val(emi.toFixed(2));
        $('#emi-header').show();
        $('#emi-header').text("EMI: ₹" + emi.toFixed(2));

    } else if (emi && rate && time && !principal) {
        // Principal Calculation (EMI, Rate, and Time are known, calculate Principal)
        const monthlyRate = rate / (12 * 100);
        principal = emi * ((Math.pow(1 + monthlyRate, time) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, time)));

        // Subtract processing fees from principal before showing it
        $('#emi-principal').val((principal).toFixed(2));
        $('#emi-header').show();
        $('#emi-header').text("Principal: ₹" + (principal).toFixed(2));
    } else if (principal && rate && emi && !time) {
        // Time Calculation (Principal, Rate, and EMI are known, calculate Time)
        const monthlyRate = rate / (12 * 100);
        time = Math.log(emi / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);

        if (timeUnit === 'weeks') {
            time *= 4.345; // Convert time from months to weeks
        } else if (timeUnit === 'years') {
            time /= 12; // Convert time from months to years
        }

        $('#emi-time').val(Math.round(time));
        $('#emi-header').show();
        $('#emi-header').text("Time: " + Math.round(time) + " " + timeUnit);

    } else if (principal && emi && time && !rate) {
         // Rate Calculation (EMI, Principal, and Time are known, calculate Rate)
        let low = 0;
        let high = 200;
  
        while (high - low > 1e-6) {
          rate = (low + high) / 2;
          const monthlyRate = rate / (12 * 100);
          let calculatedEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, time)) / (Math.pow(1 + monthlyRate, time) - 1);
  
          if (timeUnit === 'weeks') {
            calculatedEmi /= 4.345;
          }
  
          if (calculatedEmi > emi) {
            high = rate;
          } else {
            low = rate;
          }
        }
  
        // Check if the rate exceeds 99.99%
        if (rate >= 199.99) {
          $('#emi-rate').val(null); // Reset rate field
          alert("Interest rate is too high, please check your values.");
          return; // Stop further execution
        }
  
        $('#emi-rate').val(rate.toFixed(4)); // Set calculated rate
        $('#emi-header').show();
        $('#emi-header').text("Rate of Interest: " + rate.toFixed(2) + '%');
    } else if (principal && emi && time && rate) {
        alert("All the fields are already filled, Please erase the one to be calculated!");
    } else {
        alert("Please fill at least three fields to calculate the missing one.");
    }

    // Calculate total interest and total amount
    const totalInterest = emi * time - principal;
    const totalAmount = principal + totalInterest;

    $('#emi-results').show();
    $('#emi-monthly-emi').text('₹' + emi.toFixed(2));
    $('#emi-principal-amount').text('₹' + principal.toFixed(2));
    $('#emi-interest-amount').text('₹' + totalInterest.toFixed(2));
    $('#emi-total-amount').text('₹' + totalAmount.toFixed(2));

    // Update pie chart
    updatePieChart(principal, totalInterest, totalAmount, 'emi-pie-chart-container', 'emi-pie-chart');
  });
// Reset Function
$('#emi-reset').click(function () {
    $('#emi-principal').val('');
    $('#emi-processing-fees').val('');
    $('#emi-rate').val('');
    $('#emi-time').val('');
    $('#emi-amount').val('');
    $('#emi-time-unit').val('months');
    $('#emi-header').hide();
    $('#emi-results').hide();
    $('#emi-pie-chart-container').hide();
});

/*** FD Calculator Functionality ***/
$('#fd-calculate').click(function () {
    let investment = parseFloat($('#fd-investment').val()) || 0;
    let rate = parseFloat($('#fd-rate').val()) || 0;
    let time = parseFloat($('#fd-time').val()) || 0;
    let maturityAmount = parseFloat($('#fd-mature').val()) || 0;
    let timeUnit = $('#fd-time-unit').val();
    let compounding = $('#fd-compounding-period').val();

    // Adjust time based on selected unit
    if (timeUnit === 'months') {
        time /= 12;
    } else if (timeUnit === 'weeks') {
        time /= 52;
    }

    // Compounding frequency
    let n = 1; // Annually
    if (compounding === 'semi-annually') {
        n = 2;
    } else if (compounding === 'quarterly') {
        n = 4;
    } else if (compounding === 'monthly') {
        n = 12;
    }

    // Calculate missing field based on provided inputs
    if (investment && rate && time && !maturityAmount) {
        // Calculate Maturity Amount
        maturityAmount = investment * Math.pow(1 + rate / (n * 100), n * time);
        $('#fd-mature').val(maturityAmount.toFixed(2));
    } else if (rate && time && maturityAmount && !investment) {
        // Calculate Investment Amount
        investment = maturityAmount / Math.pow(1 + rate / (n * 100), n * time);
        $('#fd-investment').val(investment.toFixed(2));
    } else if (investment && maturityAmount && time && !rate) {
        // Calculate Rate of Interest
        rate = n * 100 * (Math.pow(maturityAmount / investment, 1 / (n * time)) - 1);
        $('#fd-rate').val(rate.toFixed(2));
    } else if (investment && rate && maturityAmount && !time) {
        // Calculate Time Period
        time = Math.log(maturityAmount / investment) / (n * Math.log(1 + rate / (n * 100)));
        if (timeUnit === 'months') {
            time *= 12; // Convert to months
        } else if (timeUnit === 'weeks') {
            time *= 52; // Convert to weeks
        }
        $('#fd-time').val(time.toFixed(2));
    } else if (investment && rate && maturityAmount && time) {
        alert("All the fields are already filled, Please erase the one to be calculated!");
    } else {
        alert("Please fill at least 3 fields to calculate the missing value.");
        return;
    }

    // Calculate Interest Earned and display results
    const interestEarned = maturityAmount - investment;

    $('#fd-results').show();
    $('#fd-investment-amount').text('₹' + investment.toFixed(2));
    $('#fd-interest-earned').text('₹' + interestEarned.toFixed(2));
    $('#fd-maturity-amount').text('₹' + maturityAmount.toFixed(2));
    $('#fd-header').show();
    $('#fd-header').text("Maturity Amount: ₹" + maturityAmount.toFixed(2));

    updatePieChart(investment, interestEarned, maturityAmount, 'fd-pie-chart-container', 'fd-pie-chart');
});
// Reset functionality
$('#fd-reset').click(function () {
    $('#fd-investment').val('');
    $('#fd-rate').val('');
    $('#fd-time').val('');
    $('#fd-time-unit').val('years');
    $('#fd-compounding-period').val('annually');
    $('#fd-header').hide();  // Hide header
    $('#fd-results').hide(); // Hide results
    $('#fd-pie-chart-container').hide(); // Hide pie chart container
});



/*** RD Calculator Functionality ***/
$('#rd-calculate').click(function () {
    let monthlyInvestment = parseFloat($('#rd-monthly-investment').val()) || 0;
    let rate = parseFloat($('#rd-rate').val()) || 0;
    let time = parseFloat($('#rd-time').val()) || 0;
    let maturityAmount = parseFloat($('#rd-expected-return').val()) || 0;
    let timeUnit = $('#rd-time-unit').val();
    let compounding = $('#rd-compounding-period').val();

    // Adjust time based on selected unit
    if (timeUnit === 'months') {
        time /= 12; // Convert months to years
    } else if (timeUnit === 'weeks') {
        time /= 52; // Convert weeks to years
    }
    console.log("Time 1:" + time);
    // Determine compounding frequency
    let n = 1; // Annually
    if (compounding === 'semi-annually') {
        n = 2;
    } else if (compounding === 'quarterly') {
        n = 4;
    } else if (compounding === 'monthly') {
        n = 12;
    }

    // Calculate missing field based on provided inputs
    if (monthlyInvestment && rate && time && !maturityAmount) {
        $('#rd-header').hide();
        // Calculate Maturity Amount
        maturityAmount = 0;
        const r = rate / (n * 100);
        for (let i = 1; i <= time * 12; i++) {
            maturityAmount += monthlyInvestment * Math.pow(1 + r, n * (time - (i - 1) / 12));
        }
        $('#rd-expected-return').val(maturityAmount.toFixed(2));
        $('#rd-header').show();
        $('#rd-header').text("Maturity Amount: ₹" + maturityAmount.toFixed(2));
    } else if (rate && time && maturityAmount && !monthlyInvestment) {
        $('#rd-header').hide();
        // Calculate Monthly Investment
        const r = rate / (n * 100);
        let discountFactorTotal = 0;
        for (let i = 1; i <= time * 12; i++) {
            let remainingTime = time - (i - 1) / 12;
            discountFactorTotal += Math.pow(1 + r, n * remainingTime);
        }
        monthlyInvestment = maturityAmount / discountFactorTotal;
        $('#rd-monthly-investment').val(monthlyInvestment.toFixed(2));
        $('#rd-header').show();
        $('#rd-header').text("Monthly Investment: ₹" + monthlyInvestment.toFixed(2));
    } else if (monthlyInvestment && maturityAmount && time && !rate) {
        $('#rd-header').hide();
        // Calculate Rate of Interest
        const iterations = 1000; // Iteration for rate approximation
        let low = 0,
            high = 100,
            estimatedRate = 0;
        while (high - low > 0.0001) {
            let mid = (low + high) / 2;
            const r = mid / (n * 100);
            let tempMaturity = 0;
            for (let i = 1; i <= time * 12; i++) {
                tempMaturity += monthlyInvestment * Math.pow(1 + r, n * (time - (i - 1) / 12));
            }
            if (tempMaturity > maturityAmount) {
                high = mid;
            } else {
                low = mid;
            }
            estimatedRate = mid;
        }
        $('#rd-rate').val(estimatedRate.toFixed(2));
        $('#rd-header').show();
        $('#rd-header').text("Rate of Interest: ₹" + estimatedRate.toFixed(2));
    } else if (monthlyInvestment && rate && maturityAmount && !time) {
        $('#rd-header').hide();
        const r = rate / (n * 100);
        let low = 0; // Minimum possible time (years)
        let high = 50; // Arbitrary max time (50 years)
        let epsilon = 0.0001; // Precision for stopping
        while (high - low > epsilon) {
            let mid = (low + high) / 2;
            let estimatedMaturity = 0;

            for (let i = 1; i <= mid * 12; i++) {
                let remainingTime = mid - (i - 1) / 12;
                estimatedMaturity += monthlyInvestment * Math.pow(1 + r, n * remainingTime);
            }

            if (estimatedMaturity < maturityAmount) {
                low = mid; // Increase time
            } else {
                high = mid; // Decrease time
            }
        }
        // Final time (average of low and high)
        time = (low + high) / 2;
        // Convert to required unit
        if (timeUnit === 'months') {
            time *= 12; // Convert to months
        } else if (timeUnit === 'weeks') {
            time *= 52; // Convert to weeks
        }
        $('#rd-time').val(time.toFixed(2));
        $('#rd-header').show();
        $('#rd-header').text("Approximate Time: " + time.toFixed(2) +" "+ timeUnit);
        console.log("Time:" + time);
    } else if (monthlyInvestment && rate && maturityAmount && time) {
        alert("All the fields are already filled. Please erase the one to be calculated!");
    } else {
        alert("Please fill at least 3 fields to calculate the missing value.");
        return;
    }

    // Calculate Total Investment and Interest Earned
    const totalInvestment = monthlyInvestment * 12 * time.toFixed(2);
    console.log(time);
    const interestEarned = maturityAmount - totalInvestment;

    // Display results
    $('#rd-results').show();
    $('#rd-total-investment').text('₹' + totalInvestment.toFixed(2));
    $('#rd-interest-earned').text('₹' + interestEarned.toFixed(2));
    $('#rd-maturity-amount').text('₹' + maturityAmount.toFixed(2));

    updatePieChart(totalInvestment, interestEarned, maturityAmount, 'rd-pie-chart-container', 'rd-pie-chart');
});
// Reset functionality
$('#rd-reset').click(function () {
    $('rd-expected-return').val('');
    $('#rd-monthly-investment').val('');
    $('#rd-rate').val('');
    $('#rd-time').val('');
    $('#rd-time-unit').val('years');
    $('#rd-compounding-period').val('annually');
    $('#rd-results').hide();
    $('#rd-pie-chart-container').hide();
    $('#rd-header').hide();
});

// Function to update the pie chart based on results
function updatePieChart(principal, interest, total, containerId, chartId) {
    const principalPercent = (principal / total) * 100;
    const interestPercent = (interest / total) * 100;

    $(`#${chartId}`).css({
        '--slice1-end': `${principalPercent}%`,
        '--slice2-end': `${principalPercent + interestPercent}%`
    });

    $(`#${containerId}`).show();
}

});
