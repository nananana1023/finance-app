/// <reference types="cypress" />

describe("Profile Page", () => {
  it("update user and financial profile forms", () => {
    //log in
    cy.visit("/");
    cy.get('input[placeholder="Username"]').type("nana1023");
    cy.get('input[placeholder="Password"]').type("Polokolo0)");
    cy.get("button").contains("Log In").click();

    //profile
    cy.get("nav").within(() => {
      cy.contains("Profile").click();
    });
    cy.wait(1000);
    cy.url().should("include", "/profile");

    //edit financial prof
    cy.contains("Financial Profile").click();
    cy.contains("Monthly Income:").should("exist");
    cy.contains("Edit").click();
    cy.get('input[name="monthly_income"]').clear().type("900000");
    cy.get('input[name="monthly_spending_goal"]').clear().type("400000");
    cy.get('select[name="savings_percent"]').select("30%");
    cy.contains("Save").click();
    cy.wait(1000);
    cy.contains("Your financial profile is updated successfully!").should(
      "be.visible"
    );

    //user profile
    cy.contains("User Profile").click();
    cy.contains("Change Password").click();
    cy.url().should("include", "/change-password");
    cy.contains("Back to Profile").click();
    cy.contains("User Profile").click();
    cy.contains("Change Username").click();
    cy.url().should("include", "/change-username");
    cy.contains("Back to Profile").click();

    //log out
    cy.contains("Log Out").click();
    cy.url().should("include", "/");
  });
});
