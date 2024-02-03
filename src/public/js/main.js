document.addEventListener("DOMContentLoaded", function () {
  initializeTooltips();
  initializeDataTable();
});

function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

async function initializeDataTable() {
  const { columns, values } = await (
    await fetch("/investment-companies")
  ).json();
  const transformedColumns = columns.map((item) => ({
    data: item,
    title: item,
  }));

  new DataTable("#table", {
    deferRender: true,
    stateSave: true,
    retrieve: true,
    order: [[5, "desc"]],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/da.json",
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
    columnDefs: [
      {
        targets: "_all",
        defaultContent: "",
      },
    ],
    initComplete: function () {
      document.querySelector("#spinner")?.classList.add("d-none");
    },
  });
}
