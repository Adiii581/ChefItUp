export default function Safety() {
  return (
    <div className="safety-page">
      <h1 className="section-title">Kitchen Safety Guide</h1>
      <p className="safety-page-intro">
        Cooking in a microwave or small appliance is quick and convenient, but it comes with
        important safety considerations. Follow these guidelines every time you cook.
      </p>

      <div className="safety-grid">
        <div className="safety-card">
            <h2>Microwave Safety</h2>
          <ul>
            <li>Never put aluminum foil, metal utensils, or metal-trimmed containers in the microwave.</li>
            <li>Use only microwave-safe containers (look for the microwave-safe symbol).</li>
            <li>Leave a small gap when covering food to allow steam to escape.</li>
            <li>Stir or rotate food halfway through cooking for even heating.</li>
            <li>Let food rest for 1–2 minutes after microwaving — it continues to cook.</li>
            <li>Never microwave sealed containers or whole eggs — pressure can build and cause explosions.</li>
          </ul>
        </div>

        <div className="safety-card">
            <h2>Food Temperature & Storage</h2>
          <ul>
            <li>Cook poultry to an internal temperature of at least 165°F (74°C).</li>
            <li>Cook ground meat to at least 160°F (71°C).</li>
            <li>Refrigerate leftovers within 2 hours of cooking.</li>
            <li>Never thaw frozen food at room temperature — use the fridge or microwave.</li>
            <li>Do not reheat leftovers more than once.</li>
            <li>When in doubt, throw it out — don't risk eating spoiled food.</li>
          </ul>
        </div>

        <div className="safety-card">
            <h2>Hygiene & Cross-Contamination</h2>
          <ul>
            <li>Always wash hands with soap and water before and after handling food.</li>
            <li>Use separate cutting boards for raw meat and vegetables.</li>
            <li>Clean countertops and utensils before and after each use.</li>
            <li>Never place cooked food on a surface that held raw meat without washing it first.</li>
            <li>Replace sponges and dish cloths regularly — they harbour bacteria.</li>
          </ul>
        </div>

        <div className="safety-card">
            <h2>Appliance Safety</h2>
          <ul>
            <li>Never leave heating appliances (rice cooker, kettle, toaster) unattended.</li>
            <li>Keep appliances away from water and wet surfaces.</li>
            <li>Unplug appliances when not in use.</li>
            <li>Check cords regularly for fraying or damage — replace if worn.</li>
            <li>Do not overload power outlets or use damaged extension cords.</li>
          </ul>
        </div>

        <div className="safety-card">
            <h2>Allergies & Dietary Restrictions</h2>
          <ul>
            <li>Always check ingredient labels for allergens before cooking.</li>
            <li>Common allergens: nuts, dairy, eggs, gluten, shellfish, soy.</li>
            <li>If cooking for others, always ask about dietary restrictions first.</li>
            <li>Keep an EpiPen nearby if you or someone you cook for has a severe allergy.</li>
            <li>Clean all surfaces and utensils thoroughly when preparing allergen-free meals.</li>
          </ul>
        </div>

        <div className="safety-card">
            <h2>General Best Practices</h2>
          <ul>
            <li>Read the full recipe before you start cooking.</li>
            <li>Keep a fire extinguisher accessible in your kitchen or dorm.</li>
            <li>Never cook while tired, distracted, or under the influence of alcohol.</li>
            <li>Keep a first aid kit nearby for minor burns and cuts.</li>
            <li>If a fire starts in the microwave, keep the door closed and unplug it.</li>
          </ul>
        </div>
      </div>

      <div className="safety-disclaimer">
        <strong>Disclaimer:</strong> The safety tips provided on this platform are general guidelines
        intended for informational purposes only. ChefItUp is not responsible for any injury,
        illness, or damage resulting from the use of recipes or information on this site.
        Always exercise caution and consult a professional when in doubt.
      </div>
    </div>
  );
}
