/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, within } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom";

const setNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });
};

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
});

beforeEach(() => {
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});

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

    test('should return to bills page when i submit the form', async () => {
      //to-do write assertion
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const inputData = bills[0]

      const submitForm = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const imageInput = screen.getByTestId('file');
      const file = new File(["img"], inputData.fileName, {
        type:  ["image/jpg"],
      });

      const dropdown = screen.getByRole("combobox");
        userEvent.selectOptions(
          dropdown,
          within(dropdown).getByRole("option", { name: inputData.type })
      );
      userEvent.type(screen.getByTestId("expense-name"), inputData.name);
      userEvent.type(screen.getByTestId("amount"), inputData.amount.toString());
      userEvent.type(screen.getByTestId("datepicker"), inputData.date);
      userEvent.type(screen.getByTestId("vat"), inputData.vat.toString());
      userEvent.type(screen.getByTestId("pct"), inputData.pct.toString());
      userEvent.type(screen.getByTestId("commentary"), inputData.commentary);
      await userEvent.upload(imageInput, file);

      newBill.fileName = file.name;

      const submitButton = screen.getByRole("button", { name: /envoyer/i });

      submitForm.addEventListener("submit", handleSubmit);
      userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    })

    test(('should display no error message when i fill file input corectly'), () => {
      const newBill = setNewBill();
      const fileInput = screen.getByTestId('file');
      //const fileValidation = jest.spyOn(newBill, 'fileValidation');
      const file = new File(["img"], "image.png", {
        type:  ["image/jpg"],
      });

      const handleChangeFile = jest.fn(e => { newBill.handleChangeFile(e) });
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [file],
        },
      })

      expect(handleChangeFile).toHaveBeenCalled();
      //expect(fileValidation.mock.results[0].value).toBeTruthy();
      expect(fileInput).not.toHaveClass('is-invalid');
    })

    //Test d'intégration POST
    describe("When I do fill fields in correct format and I click on submit button", () => {
      test("Then a new bill should be created", async () => {
        const createBill = jest.fn(mockStore.bills().create);
        const updateBill = jest.fn(mockStore.bills().update);

        const { fileUrl, key } = await createBill();

        expect(createBill).toHaveBeenCalledTimes(1);

        expect(key).toBe("1234");
        expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");

        const newBill = updateBill();

        expect(updateBill).toHaveBeenCalledTimes(1);

        await expect(newBill).resolves.toEqual({
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        });
      });
    });     
  })  
})

const selectExpenseType = expenseType => {
  const dropdown = screen.getByRole("combobox");
  userEvent.selectOptions(
    dropdown,
    within(dropdown).getByRole("option", { name: expenseType })
  );
  return dropdown;
};

const getExpenseName = () => screen.getByTestId("expense-name");

const getAmount = () => screen.getByTestId("amount");

const getDate = () => screen.getByTestId("datepicker");

const getVat = () => screen.getByTestId("vat");

const getPct = () => screen.getByTestId("pct");

const getCommentary = () => screen.getByTestId("commentary");

const getFile = (fileName, fileType) => {
  const file = new File(["img"], fileName, {
    type: [fileType],
  });

  return file;
};
