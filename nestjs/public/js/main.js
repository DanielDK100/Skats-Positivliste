window.toggleTheme = () => ThemeManager.toggle();
// DOMContentLoaded entry point
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init(false);
  ThemeManager.init(true);
  TooltipManager.init();
  DataTableManager.init();
  ChartManager.init();
});

// Theme management
const ThemeManager = {
  init(domLoaded) {
    const savedTheme = localStorage.getItem("themePreference");
    const htmlTag = document.querySelector("html");
    if (savedTheme) {
      htmlTag.setAttribute("data-bs-theme", savedTheme);
      if (domLoaded) {
        const switchCheckbox = document.querySelector("#switch-theme");
        if (switchCheckbox) switchCheckbox.checked = savedTheme === "dark";
      }
    }
  },
  toggle() {
    const switchCheckbox = document.querySelector("#switch-theme");
    const htmlTag = document.querySelector("html");
    const themeValue = switchCheckbox.checked ? "dark" : "light";
    htmlTag.setAttribute("data-bs-theme", themeValue);
    localStorage.setItem("themePreference", themeValue);
    gtag("event", "theme", {
      event_category: "switch",
      event_label: themeValue,
    });
  },
};

// Tooltip management
const TooltipManager = {
  init() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(
      (el) => new bootstrap.Tooltip(el)
    );
  },
};

// ISIN input sanitizer
const sanitizeIsinInput = () => {
  const isin = document.querySelector("#isin-input");
  if (isin) isin.value = isin.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

// DataTable management
const DataTableManager = {
  async init() {
    const table = document.querySelector("#table");
    if (!table) return;
    const { columns, values } = await fetchJson("/investment-companies");
    const transformedColumns = columns.map((item) => ({ data: item, title: item }));
    const dataTableOptions = {
      columnControl: [
        {
            target: 0,
            content: ['orderStatus']
        },
        {
            target: 1,
            content: ['search']
        }
      ],
      layout: {
        topStart: {
          buttons: [
            { extend: 'copy', className: 'btn btn-sm' },
            { extend: 'csv', className: 'btn btn-sm' },
            { extend: 'excel', className: 'btn btn-sm' },
            { 
              extend: 'pdf', 
              className: 'btn btn-sm',
              orientation: 'landscape'
            },
          ],
          pageLength: 'pageLength',
        },
      },
      responsive: true,
      deferRender: true,
      columnDefs: [
        {
          responsivePriority: 2,
          targets: -1,
          render: (data) => `<span class="badge bg-secondary">${String(data).replace(/\s+/g, "").split(/[,\.]/).sort((a, b) => b - a).join(", <br>")}</span>`
        },
        {
          responsivePriority: 3,
          targets: 1,
          render: (data) => /^[A-Z]{2}[0-9A-Z]{10}$/.test(data.trim())
            ? `<a href='https://morningstar.dk/dk/funds/SecuritySearchResults.aspx?search=${data.trim()}' rel='noreferrer' target='_blank' title='Morningstar.dk'>${data.trim()}</a>`
            : data
        },
      ],
      stateSave: true,
      retrieve: true,
      order: [[0, "asc"]],
      language: {
        url: "https://cdn.datatables.net/plug-ins/2.3.2/i18n/da.json",
        searchPlaceholder: "Søg efter ETF/fond",
      },
      scrollY: "70vh",
      scrollCollapse: true,
      pageLength: 50,
      data: values,
      columns: transformedColumns,
      initComplete: () => {
        document.querySelector("#spinner")?.classList.add("d-none");
      },
    };
    new DataTable(table, dataTableOptions);
  },
};

// Chart management
const ChartManager = {
  async init() {
    const chartElement = document.querySelector("#chart");
    if (!chartElement) return;
    const topRegistrations = await fetchJson("/top-registrations");
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
        responsive: true,
        onHover: (event, chartElement) => {
          event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
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
      if (res.length > 0) {
        const label = chart.data.labels[res[0].index];
        window.open(
          `https://morningstar.dk/dk/funds/SecuritySearchResults.aspx?search=${label}`,
          "_blank"
        );
      }
    };
  },
};

// Fetch JSON helper
const fetchJson = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

// Registration form handler
const submitRegistration = () => {
  const form = document.querySelector("#submit-registration-form");
  const button = document.querySelector("#submit-registration-button");
  const spinner = document.querySelector("#submit-registration-spinner");
  if (!form.checkValidity()) return;
  gtag("event", "form_submit", {
    event_category: "registration",
    event_label: "isin_email",
  });
  button.disabled = true;
  spinner.classList.remove("d-none");
  form.submit();
};
