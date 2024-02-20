document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  initializeTooltips();
  await initializeDataTable();
}

function initializeTooltips() {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

async function initializeDataTable() {
  const { columns, values } = await fetchInvestmentCompaniesData();
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
      url: "https://cdn.datatables.net/plug-ins/2.0.0/i18n/da.json",
      searchPlaceholder: "Søg efter ETF/fond",
    },
    scrollY: "70vh",
    scrollCollapse: true,
    lengthMenu: [
      [25, 50, 100, -1],
      [25, 50, 100, "Alle"],
    ],
    pageLength: 50,
    data: values,
    columns: transformedColumns,
    initComplete: function () {
      const spinner = document.querySelector("#spinner");
      spinner?.classList.add("d-none");
    },
  };

  return new DataTable("#table", dataTableOptions);
}

async function fetchInvestmentCompaniesData() {
  const response = await fetch("/investment-companies");
  return await response.json();
}

function transformColumns(columns) {
  return columns.map((item) => ({ data: item, title: item }));
}
