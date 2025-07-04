/// <reference types="cypress" />

describe("Login and Overview Page", () => {
  it("submit valid credentials in login form, directs to overview page, change month and category", () => {
    cy.visit("/");
    //login
    cy.contains("Log In").should("exist");
    cy.get('input[placeholder="Username"]').type("nana");
    cy.get('input[placeholder="Password"]').type("Lkjklkjkl999(");
    cy.get("button").contains("Log In").should("be.enabled");
    cy.get("button").contains("Log In").click();
    //overview
    cy.url().should("include", "/userhome");
    cy.contains("Total Spent").should("exist");
    cy.contains("<").click();
    cy.get("select#category-select").select("income");
  });
});
