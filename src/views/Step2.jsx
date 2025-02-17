import { useStateMachine } from "little-state-machine";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Select from "../components/Select";
import updateAction from "../utils/updateAction";

const COLORS_ENDPOINT = "http://localhost:3001/api/colors";

const Step1 = () => {
  const [colors, setColors] = useState(null);
  const navigate = useNavigate();
  const { actions, state } = useStateMachine({ updateAction });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      terms: state.terms,
    },
  });

  // Opted to load the colors when user reaches this step for logic simplicity
  // If more complex, I would use react query and add queries to the initial step so that this data is pre-loaded (and to this step in case the user refreshes)
  // Potential UX enhancement with current solution would be to check if color value exists and if so, do not call getColors again to avoid an extra request
  // Assumption: getColors endpoint is quick enough that it can be called each time this step is loaded without impacting UX
  useEffect(() => {
    const abortController = new AbortController();

    const getColors = async () => {
      try {
        const res = await fetch(COLORS_ENDPOINT, {
          signal: abortController.signal,
        });

        const colorsArr = await res.json();

        setColors(colorsArr);

        // If user refreshed screen
        if (state.color) {
          setValue("color", state.color);
        }
      } catch (e) {
        if (!abortController.signal.aborted) {
          alert("System error. Please refresh.");
        }
      }
    };

    getColors();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBackButtonClick = () => {
    navigate("../");
  };

  const onSubmit = (data) => {
    actions.updateAction(data);

    navigate("../confirmation");
  };

  // No explicit validation in readme so added a couple basic validations based on real world apps
  // Assumption 1: Color is required
  // Assumption 2: Terms and Conditions is required
  // See Checkbox component for comment regarding rendering T&C verbiage in span instead of label
  return (
    <form data-testid="more-info-form" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl text-center mb-6">Additional Info</h1>
      <div className="flex flex-col mb-6 min-h-[200px]">
        <Select
          {...register("color", {
            required: "Color required",
          })}
          data-testid="color-select"
          defaultValue=""
          error={errors.color?.message}
          options={colors}
          placeholder="Select Your Favorite Color"
        />
        <Checkbox
          {...register("terms", {
            required: "Terms acceptance required",
          })}
          data-testid="terms-checkbox"
          error={errors.terms?.message}
        >
          <span className="ml-2">
            I agree to{" "}
            <a
              className="underline text-blue-500"
              href="https://www.upgrade.com/funnel/borrower-documents/TERMS_OF_USE"
              rel="noreferrer"
              target="_blank"
            >
              Terms and Conditions
            </a>
            .
          </span>
        </Checkbox>
      </div>
      <Button
        className="mr-2"
        cta="Back"
        type="button"
        onClick={() => onBackButtonClick()}
        variant="secondary"
      />
      <Button cta="Next" />
    </form>
  );
};

export default Step1;
