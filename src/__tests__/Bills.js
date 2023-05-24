/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor, within} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";

import Bills from "../containers/Bills.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = dates.sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the New Bill button", () => {
    test("Then I should be redirected to the New Bill page", () => {
      // const onNavigate = pathname => {
      //   document.body.innerHTML = ROUTES({ pathname });
      // };
      // Object.defineProperty(window, "localStorage", {
      //   value: localStorageMock,
      // });
      // window.localStorage.setItem(
      //   "user",
      //   JSON.stringify({
      //     type: "Employee",
      //   })
      // );
      // const bills = new Bills({
      //   document,
      //   onNavigate,
      //   store: null,
      //   localStorage: window.localStorage,
      // });
      // const newBillBtn = screen.getByTestId('btn-new-bill')
      // const handleClickNewBill = jest.fn(e => bills.handleClickNewBill(e));
      // newBillBtn.addEventListener("click", handleClickNewBill);

      // fireEvent.click(newBillBtn) 
      // expect(handleClickNewBill).toHaveBeenCalled();
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const bills = new Bills({
        document,
        onNavigate
      })

      const newBillBtn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(e => { bills.handleClickNewBill(e) });
      newBillBtn.addEventListener("click", handleClickNewBill);
      fireEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled();
    })
  })
  describe("When I click on the Eye Icon", () => {
    test("Then a modal should open", () => {
      // const onNavigate = pathname => {
      //   document.body.innerHTML = ROUTES({ pathname });
      // };
      
      // const bills = new Bills({
      //   document,
      //   onNavigate,
      //   store: mockedStore,
      // })      

      // document.body.innerHTML = BillsUI({ data: bills });
      // const modal = document.getElementById('modaleFile')
      // // const billsTable = screen.getByTestId("tbody");
      // // const iconEyes = within(billsTable).getAllByTestId("icon-eye");
      // const iconEyes = screen.getAllByTestId("icon-eye");
      // const handleClickIconEye = jest.fn(e => { bills.handleClickIconEye(e) });
      // iconEyes.forEach(iconEye => {
      //   iconEye.addEventListener("click", handleClickIconEye);
      //   fireEvent.click(iconEye)
      // })
      // expect(handleClickIconEye).toHaveBeenCalled();
      // expect(modal.classList.contains('show')).toBeTruthy()

      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsPage = new Bills({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });

      const iconEyes = screen.getAllByTestId("icon-eye");

      const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

      const modale = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modale.classList.add("show")); //mock de la modale Bootstrap

      iconEyes.forEach(iconEye => {
        iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
        userEvent.click(iconEye);

        expect(handleClickIconEye).toHaveBeenCalled();

        expect(modale.classList.contains('show')).toBeTruthy()
    })
  })
})})
