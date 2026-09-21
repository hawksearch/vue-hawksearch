/**
 * FacetNegationService
 * Handles facet value negation logic for HawkSearch filtering
 * 
 * Negation allows excluding items based on facet values:
 * - Normal facet: 'color=red' (include items matching "red")
 * - Negated facet: 'color=@red' (exclude items matching "red")
 */

export class FacetNegationService {
  static NEGATION_PREFIX = '@';

  /**
   * Creates a negated facet value string
   * @param {string} value - The facet value to negate
   * @returns {string} The negated value with '@' prefix
   * @example
   * FacetNegationService.negate('red') // returns '@red'
   */
  static negate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Value must be a non-empty string');
    }
    return this.NEGATION_PREFIX + value;
  }

  /**
   * Checks if a value is negated
   * @param {string} value - The value to check
   * @returns {boolean} True if the value starts with the negation prefix
   * @example
   * FacetNegationService.isNegated('@red') // returns true
   * FacetNegationService.isNegated('red') // returns false
   */
  static isNegated(value) {
    return typeof value === 'string' && value.startsWith(this.NEGATION_PREFIX);
  }

  /**
   * Extracts the base value from a negated string
   * Returns the base value regardless of negation state
   * @param {string} value - The value to extract from
   * @returns {string} The base value without '@' prefix
   * @example
   * FacetNegationService.extractBase('@red') // returns 'red'
   * FacetNegationService.extractBase('red') // returns 'red'
   */
  static extractBase(value) {
    if (typeof value !== 'string') {
      return value;
    }
    return this.isNegated(value) ? value.slice(this.NEGATION_PREFIX.length) : value;
  }

  /**
   * Toggles negation on a value
   * @param {string} value - The base value (without prefix)
   * @param {boolean} shouldNegate - Whether to apply negation
   * @returns {string} The value with appropriate negation state
   * @example
   * FacetNegationService.toggle('red', true) // returns '@red'
   * FacetNegationService.toggle('red', false) // returns 'red'
   */
  static toggle(value, shouldNegate) {
    const base = this.extractBase(value);
    return shouldNegate ? this.negate(base) : base;
  }

  /**
   * Normalizes a value to its base form (removes negation if present)
   * Alias for extractBase for semantic clarity
   * @param {string} value - The value to normalize
   * @returns {string} The normalized value
   */
  static normalize(value) {
    return this.extractBase(value);
  }
}
