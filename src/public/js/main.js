document.addEventListener("DOMContentLoaded", initialize);
initializeTheme(false);
async function initialize() {
  initializeTheme(true);
  initializeTooltips();
  await initializeDataTable();
  await initializeChart();
}

function initializeTheme(domLoaded) {
  const savedTheme = localStorage.getItem("themePreference");
  const htmlTag = document.querySelector("html");

  if (savedTheme) {
    htmlTag.setAttribute("data-bs-theme", savedTheme);
    if (domLoaded) {
      const switchCheckbox = document.querySelector("#switch-theme");
      switchCheckbox.checked = savedTheme === "dark";
    }
  }
}

function initializeTooltips() {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

function sanitizeIsinInput() {
  const isin = document.querySelector("#isin-input");
  isin.value = isin.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function initializeDataTable() {
  const table = document.querySelector("#table");
  if (!table) {
    return;
  }

  const { columns, values } = await fetchInvestmentCompanies();
  const transformedColumns = transformColumns(columns);
  const currentYear = new Date().getFullYear();

  const dataTableOptions = {
    responsive: true,
    columnDefs: [
      { responsivePriority: 1, targets: -1 },

      {
        targets: -1,
        render: function (data, type, row, meta) {
          const badgeClass =
            data === currentYear ? "bg-primary" : "bg-secondary";
          return `<span class="badge ${badgeClass}">${data}</span>`;
        },
      },
      {
        targets: -9,
        render: function (data, type, row, meta) {
          if (/^[A-Z]{2}.{10}$/.test(data)) {
            return `<a href='https://morningstar.dk/dk/funds/SecuritySearchResults.aspx?search=${data}' target='_blank' title='Morningstar.dk'>${data}</a>`;
          }
          return data;
        },
      },
    ],
    stateSave: true,
    retrieve: true,
    order: [[9, "desc"]],
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.3/i18n/da.json",
      searchPlaceholder: "Søg efter ETF/fond",
    },
    scrollY: "70vh",
    scrollCollapse: true,
    pageLength: 50,
    data: values,
    columns: transformedColumns,
    initComplete: function () {
      const spinner = document.querySelector("#spinner");
      spinner?.classList.add("d-none");
    },
  };

  return new DataTable(table, dataTableOptions);
}

async function initializeChart() {
  const chartElement = document.querySelector("#chart");
  if (!chartElement) {
    return;
  }

  const topRegistrations = await fetchTopRegistrations();
  const isinValues = topRegistrations.map((item) => item.isin);
  const amountValues = topRegistrations.map((item) => item.amount);

  const chartOptions = {
    type: "bar",
    data: {
      labels: isinValues,
      datasets: [
        {
          label: "Antal registreringer",
          data: amountValues,
          borderWidth: 1,
        },
      ],
    },
    options: {
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement[0]
          ? "pointer"
          : "default";
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  };
  const chart = new Chart(chartElement, chartOptions);

  chartElement.onclick = (event) => {
    const res = chart.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      true
    );
    const label = chart.data.labels[res[0].index];
    window.open(
      `https://morningstar.dk/dk/funds/SecuritySearchResults.aspx?search=${label}`,
      "_blank"
    );
  };
}

async function fetchInvestmentCompanies() {
  const response = await fetch("/investment-companies");
  return await response.json();
}

async function fetchTopRegistrations() {
  const response = await fetch("/top-registrations");
  return await response.json();
}

function transformColumns(columns) {
  return columns.map((item) => ({ data: item, title: item }));
}

function toggleTheme() {
  const switchCheckbox = document.querySelector("#switch-theme");
  const htmlTag = document.querySelector("html");
  const themeValue = switchCheckbox.checked ? "dark" : "light";

  htmlTag.setAttribute("data-bs-theme", themeValue);
  localStorage.setItem("themePreference", themeValue);

  gtag("event", "theme", {
    event_category: "switch",
    event_label: themeValue,
  });
}

function submitRegistration() {
  const form = document.querySelector("#submit-registration-form");
  const button = document.querySelector("#submit-registration-button");
  const spinner = document.querySelector("#submit-registration-spinner");

  if (!form.checkValidity()) {
    return;
  }

  gtag("event", "form_submit", {
    event_category: "registration",
    event_label: "isin_email",
  });

  button.disabled = true;
  spinner.classList.remove("d-none");

  form.submit();
}
