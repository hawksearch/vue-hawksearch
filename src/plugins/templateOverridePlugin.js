import { compile } from 'vue';

// Overrides the template prioritization
// If the 'templateOverride' configuration is available, it overrides all other templates
const generateTemplateOverride = function (name, config, instance) {
  const props = instance.$props;
  let templateOverride = props && props.templateOverride;

  if (!templateOverride && name && config.generateTemplateOverrides) {
    templateOverride = '#vue-hawksearch-' + name;
  }

  if (templateOverride
      && typeof templateOverride === 'string'
      && templateOverride.charAt(0) === '#'
      && document.querySelector(templateOverride)
  ) {
    const templateContent = document.querySelector(templateOverride).innerHTML;
    if (templateContent) {
      const renderFunction = compile(templateContent);

      if (renderFunction) {
        return function wrappedRender(...args) {
          const originalWarn = console.warn;
          console.warn = () => {};
          const result = renderFunction.call(instance, ...args);
          console.warn = originalWarn;
          return result;
        }
      }
    }
  }

  return null;
};

const wrapComponent = function (component, config) {
  if (component.__isWrapped || !component.render) {
    return component;
  }

  const originalRender = component.render;

  const wrappedComponent = {
    ...component,
    render(...args) {
      const overridedRender = generateTemplateOverride(
        component.name,
        config,
        this,
      );
      if (overridedRender) {
        return overridedRender.call(this, ...args);
      }
      return originalRender.call(this, ...args);
    },
  };

  wrappedComponent.__isWrapped = true;

  return wrappedComponent;
};

const templateOverridePlugin = {
  install(app, config) {
    app.mixin({
      beforeCreate() {
        if (wrapComponent) {
          const components = this.$options.components || {};
          Object.keys(components).forEach((key) => {
            components[key] = wrapComponent(components[key], config);
          });
        }
      },
    });
  }
};

export default templateOverridePlugin;
