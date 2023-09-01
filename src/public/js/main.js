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

function initializeDataTable() {
  setTimeout(() => {
    document.querySelector("#table")?.classList.remove("invisible");
    new DataTable("#table", {
      stateSave: true,
      retrieve: true,
      order: [[3, "desc"]],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.2/i18n/da.json",
        searchPlaceholder: "Søg efter ETF/fond",
      },
      scrollY: "70vh",
      scrollCollapse: true,
      lengthMenu: [
        [25, 50, 100, -1],
        [25, 50, 100, "Alle"],
      ],
      pageLength: 50,
    });
    document.querySelector("#spinner")?.classList.add("d-none");
  }, 3000);
}
