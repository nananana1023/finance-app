/// <reference types="cypress" />

describe("Transactions Page", () => {
  it("add a record, filter transactions", () => {
    //log in
    cy.visit("/");
    cy.get('input[placeholder="Username"]').type("nana");
    cy.get('input[placeholder="Password"]').type("Lkjklkjkl999(");
    cy.get("button").contains("Log In").click();

    //add trans
    cy.get("nav").within(() => {
      cy.contains("Transactions").click();
    });
    cy.wait(1000);
    cy.url().should("include", "/transactions");
    cy.contains("Your Transactions").should("exist");
    cy.contains("Add Transaction").click();
    cy.get('select[name="subcategory"]').select("salary");
    cy.get('input[name="amount"]').type("700000");
    cy.get('input[name="note"]').type("yay");
    cy.get('input[name="date"]').type("2024-04-30");
    cy.get('button[type="submit"]').contains("Add").click();

    //filter
    cy.get("select").first().select("income");
    cy.get('input[placeholder="Min Amount"]').type("100");
    cy.get('input[placeholder="Max Amount"]').type("1000");
    cy.get("input#minDate").type("2024-01-01");
    cy.get("input#maxDate").type("2024-03-31");
    cy.contains("button", "Search").click();
  });
});
