/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("should display file name when I choose a file", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn(e => { newBill.handleChangeFile(e) });
      const file = screen.getByTestId('file')
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(['image.png'], 'image.png', { type: 'image/png' })],
        },
      })

      expect(file.files[0].name).toBe('image.png')
    })

    test('should return to bills page', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const submitBtn = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(e => { newBill.handleSubmit(e) });
      submitBtn.addEventListener("submit", handleSubmit);
      userEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
