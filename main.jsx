const { useState, useMemo } = React;

// --- Mock data for Clients, REQs and Talents ---
const CLIENTS = [
  {
    id: "collabera",
    name: "Collabera - Collabera Inc",
    reqs: [
      {
        id: "OWNAI_234",
        title: "Application Development",
        talents: [
          { id: "t1", name: "Monika Goyal Test" },
          { id: "t2", name: "Shaili Khatri" }
        ]
      },
      {
        id: "CLK_12880",
        title: "Business Administrator",
        talents: [{ id: "t3", name: "Alex Doe" }]
      }
    ]
  }
];

const CURRENCIES = [
  { code: "USD", label: "USD – Dollars ($)" },
  { code: "EUR", label: "EUR – Euro (€)" },
  { code: "INR", label: "INR – Rupees (₹)" }
];

const defaultReqSection = () => ({
  clientId: "",
  jobTitleId: "",
  reqId: "",
  talents: {} // talentId -> { selected, contractDuration, billRate, currency, stdTimeBR, otBR }
});

const initialFormState = {
  clientId: "",
  poType: "",
  poNumber: "",
  receivedOn: "",
  receivedFromName: "",
  receivedFromEmail: "",
  poStartDate: "",
  poEndDate: "",
  budget: "",
  budgetCurrency: "USD",
  reqSections: [defaultReqSection()]
};

function PurchaseOrderForm() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const selectedClient = useMemo(
    () => CLIENTS.find((c) => c.id === form.clientId) || null,
    [form.clientId]
  );

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleReqChange = (index, changes) => {
    setForm((prev) => {
      const reqSections = [...prev.reqSections];
      reqSections[index] = { ...reqSections[index], ...changes };
      return { ...prev, reqSections };
    });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`req-${index}`];
      return copy;
    });
  };

  const handleTalentToggle = (sectionIndex, talentId, checked) => {
    setForm((prev) => {
      const reqSections = [...prev.reqSections];
      const section = { ...reqSections[sectionIndex] };
      const talents = { ...section.talents };

      // For individual PO we allow only a single talent overall
      if (prev.poType === "individual" && checked) {
        // Clear all selections across all sections
        const cleared = prev.reqSections.map((s, sIdx) => {
          const newTalents = {};
          Object.entries(s.talents).forEach(([id, t]) => {
            newTalents[id] = { ...t, selected: false };
          });
          return { ...s, talents: newTalents };
        });
        reqSections.splice(0, cleared.length, ...cleared);
      }

      const existing = talents[talentId] || {
        selected: false,
        contractDuration: "",
        billRate: "",
        currency: "USD",
        stdTimeBR: "",
        otBR: ""
      };
      talents[talentId] = { ...existing, selected: checked };
      section.talents = talents;
      reqSections[sectionIndex] = section;
      return { ...prev, reqSections };
    });
  };

  const handleTalentFieldChange = (sectionIndex, talentId, field, value) => {
    setForm((prev) => {
      const reqSections = [...prev.reqSections];
      const section = { ...reqSections[sectionIndex] };
      const talents = { ...section.talents };
      const existing = talents[talentId] || {
        selected: false,
        contractDuration: "",
        billRate: "",
        currency: "USD",
        stdTimeBR: "",
        otBR: ""
      };
      talents[talentId] = { ...existing, [field]: value };
      section.talents = talents;
      reqSections[sectionIndex] = section;
      return { ...prev, reqSections };
    });
  };

  const addReqSection = () => {
    setForm((prev) => ({
      ...prev,
      reqSections: [...prev.reqSections, defaultReqSection()]
    }));
  };

  const removeReqSection = (index) => {
    setForm((prev) => ({
      ...prev,
      reqSections: prev.reqSections.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.clientId) newErrors.clientId = "Client Name is required.";
    if (!form.poType) newErrors.poType = "Purchase Order Type is required.";
    if (!form.poNumber) newErrors.poNumber = "Purchase Order No. is required.";
    if (!form.receivedOn) newErrors.receivedOn = "Received On is required.";
    if (!form.receivedFromName)
      newErrors.receivedFromName = "Received From Name is required.";
    if (!form.receivedFromEmail)
      newErrors.receivedFromEmail = "Received From Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.receivedFromEmail))
      newErrors.receivedFromEmail = "Enter a valid email address.";

    if (!form.poStartDate) newErrors.poStartDate = "PO Start Date is required.";
    if (!form.poEndDate) newErrors.poEndDate = "PO End Date is required.";
    if (form.poStartDate && form.poEndDate && form.poEndDate < form.poStartDate)
      newErrors.poEndDate = "End date cannot be before Start date.";

    if (!form.budget) newErrors.budget = "Budget is required.";
    else if (!/^\d{1,5}$/.test(form.budget))
      newErrors.budget = "Budget must be numeric and up to 5 digits.";

    // Talent validations
    let totalSelectedTalents = 0;
    form.reqSections.forEach((section, idx) => {
      if (!section.jobTitleId) {
        newErrors[`req-${idx}`] = "Job Title / REQ Name is required.";
      }

      Object.values(section.talents).forEach((t) => {
        if (t.selected) {
          totalSelectedTalents += 1;
          if (!t.contractDuration || !t.billRate || !t.currency) {
            newErrors[`req-${idx}`] =
              "All selected talents must have Contract Duration, Bill Rate and Currency.";
          }
        }
      });
    });

    if (form.poType === "individual" && totalSelectedTalents !== 1) {
      newErrors.talents =
        "For Individual PO, exactly one talent must be selected.";
    }

    if (form.poType === "group" && totalSelectedTalents < 2) {
      newErrors.talents =
        "For Group PO, at least two talents must be selected.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Purchase Order Submitted:", form);
    setSubmittedData(form);
    setIsReadOnly(true);
  };

  const handleReset = () => {
    setForm(initialFormState);
    setErrors({});
    setIsReadOnly(false);
    setSubmittedData(null);
  };

  const onClientChange = (value) => {
    // Reset REQ sections when client changes
    handleFieldChange("clientId", value);
    setForm((prev) => ({
      ...prev,
      reqSections: [defaultReqSection()]
    }));
  };

  const onJobChange = (sectionIndex, jobId) => {
    if (!selectedClient) {
      handleReqChange(sectionIndex, { jobTitleId: jobId, reqId: "" });
      return;
    }
    const job = selectedClient.reqs.find((r) => r.id === jobId);
    const talentsState = {};
    if (job) {
      job.talents.forEach((t) => {
        talentsState[t.id] = {
          selected: false,
          contractDuration: "",
          billRate: "",
          currency: "USD",
          stdTimeBR: "",
          otBR: ""
        };
      });
    }
    handleReqChange(sectionIndex, {
      jobTitleId: jobId,
      reqId: job ? job.id : "",
      talents: talentsState
    });
  };

  const renderTalentRows = (section, sectionIndex) => {
    if (!selectedClient || !section.jobTitleId) return null;
    const job = selectedClient.reqs.find((r) => r.id === section.jobTitleId);
    if (!job) return null;

    return job.talents.map((talent) => {
      const state = section.talents[talent.id] || {
        selected: false,
        contractDuration: "",
        billRate: "",
        currency: "USD",
        stdTimeBR: "",
        otBR: ""
      };

      const disableCheckbox =
        form.poType === "individual" &&
        !state.selected &&
        // disallow selecting more than one talent
        form.reqSections.some((s) =>
          Object.values(s.talents).some((t) => t.selected)
        );

      return (
        <div className="po-talent-row" key={talent.id}>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={`talent-${sectionIndex}-${talent.id}`}
              checked={state.selected}
              disabled={isReadOnly || disableCheckbox}
              onChange={(e) =>
                handleTalentToggle(sectionIndex, talent.id, e.target.checked)
              }
            />
            <label
              className="form-check-label po-talent-name"
              htmlFor={`talent-${sectionIndex}-${talent.id}`}
            >
              {talent.name}
            </label>
          </div>

          {state.selected && (
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <label className="form-label">
                  Contract Duration <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Months"
                  value={state.contractDuration}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    handleTalentFieldChange(
                      sectionIndex,
                      talent.id,
                      "contractDuration",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">
                  Bill Rate <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Bill Rate"
                    value={state.billRate}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleTalentFieldChange(
                        sectionIndex,
                        talent.id,
                        "billRate",
                        e.target.value
                      )
                    }
                  />
                  <span className="input-group-text">/hr</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">
                  Currency <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={state.currency}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    handleTalentFieldChange(
                      sectionIndex,
                      talent.id,
                      "currency",
                      e.target.value
                    )
                  }
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">Standard Time BR</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Std. Time BR"
                    value={state.stdTimeBR}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleTalentFieldChange(
                        sectionIndex,
                        talent.id,
                        "stdTimeBR",
                        e.target.value
                      )
                    }
                  />
                  <span className="input-group-text">/hr</span>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">Over Time BR</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Over Time BR"
                    value={state.otBR}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleTalentFieldChange(
                        sectionIndex,
                        talent.id,
                        "otBR",
                        e.target.value
                      )
                    }
                  />
                  <span className="input-group-text">/hr</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="po-shell">
      <div className="container-fluid">
        <div className="po-header">
          <div className="po-back-pill">
            <span className="text-muted">&lt;</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="po-title">Purchase Order | New</span>
            {isReadOnly && (
              <span className="po-readonly-badge">Read Only (Saved)</span>
            )}
          </div>
        </div>

        <div className="po-card">
          <form onSubmit={handleSubmit}>
            <div className="po-section">
              <div className="po-section-title">Purchase Order Details</div>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">
                    Client Name <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.clientId}
                    disabled={isReadOnly}
                    onChange={(e) => onClientChange(e.target.value)}
                  >
                    <option value="">Select Client</option>
                    {CLIENTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <div className="po-error">{errors.clientId}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Purchase Order Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.poType}
                    disabled={isReadOnly}
                    onChange={(e) => handleFieldChange("poType", e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="group">Group PO</option>
                    <option value="individual">Individual PO</option>
                  </select>
                  {errors.poType && (
                    <div className="po-error">{errors.poType}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Purchase Order No. <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.poNumber}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("poNumber", e.target.value)
                    }
                  />
                  {errors.poNumber && (
                    <div className="po-error">{errors.poNumber}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Received On <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.receivedOn}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("receivedOn", e.target.value)
                    }
                  />
                  {errors.receivedOn && (
                    <div className="po-error">{errors.receivedOn}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Received From (Name) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.receivedFromName}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("receivedFromName", e.target.value)
                    }
                    placeholder="Received From Name"
                  />
                  {errors.receivedFromName && (
                    <div className="po-error">{errors.receivedFromName}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Received From (Email ID){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.receivedFromEmail}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("receivedFromEmail", e.target.value)
                    }
                    placeholder="name@example.com"
                  />
                  {errors.receivedFromEmail && (
                    <div className="po-error">{errors.receivedFromEmail}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    PO Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.poStartDate}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("poStartDate", e.target.value)
                    }
                  />
                  {errors.poStartDate && (
                    <div className="po-error">{errors.poStartDate}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    PO End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.poEndDate}
                    min={form.poStartDate || undefined}
                    disabled={isReadOnly}
                    onChange={(e) =>
                      handleFieldChange("poEndDate", e.target.value)
                    }
                  />
                  {errors.poEndDate && (
                    <div className="po-error">{errors.poEndDate}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Budget <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={form.budget}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        handleFieldChange("budget", e.target.value)
                      }
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: "180px" }}
                      value={form.budgetCurrency}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        handleFieldChange("budgetCurrency", e.target.value)
                      }
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.budget && (
                    <div className="po-error">{errors.budget}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="po-section-divider" />

            <div className="po-section">
              <div className="d-flex justify-content-between align-items-center">
                <div className="po-section-title">Talent Detail</div>
                {form.poType === "group" && !isReadOnly && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-soft"
                    onClick={addReqSection}
                  >
                    + Add Another
                  </button>
                )}
              </div>

              {form.reqSections.map((section, index) => (
                <div key={index} className="mb-4 border rounded-3 p-3">
                  <div className="po-req-header">
                    <div className="fw-semibold">
                      REQ {index + 1}
                      {section.reqId ? ` – ${section.reqId}` : ""}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {section.reqId && (
                        <span className="badge text-bg-light">
                          Job ID / REQ ID: {section.reqId}
                        </span>
                      )}
                      {form.reqSections.length > 1 && !isReadOnly && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeReqSection(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-2">
                    <div className="col-md-4 col-lg-3">
                      <label className="form-label">
                        Job Title / REQ Name{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={section.jobTitleId}
                        disabled={isReadOnly || !selectedClient}
                        onChange={(e) =>
                          onJobChange(index, e.target.value || "")
                        }
                      >
                        <option value="">Select Job</option>
                        {selectedClient?.reqs.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 col-lg-3">
                      <label className="form-label">
                        Job ID / REQ ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={section.reqId}
                        readOnly
                      />
                    </div>
                  </div>

                  {renderTalentRows(section, index)}

                  {errors[`req-${index}`] && (
                    <div className="po-error mt-2">{errors[`req-${index}`]}</div>
                  )}
                </div>
              ))}

              {errors.talents && (
                <div className="po-error mt-1">{errors.talents}</div>
              )}
            </div>

            <div className="po-footer">
              <button
                type="button"
                className="btn btn-outline-soft btn-pill"
                onClick={handleReset}
              >
                Reset
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  className="btn btn-primary-soft btn-pill text-white"
                >
                  Save
                </button>
              )}
            </div>
          </form>
        </div>

        {submittedData && (
          <div className="mt-3 small text-muted">
            Open the console to see the submitted JSON payload.
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PurchaseOrderForm />);

