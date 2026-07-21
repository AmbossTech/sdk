# Changelog

## [0.2.0](https://github.com/AmbossTech/sdk/compare/payments-v0.1.1...payments-v0.2.0) (2026-07-21)


### Features

* add receive option to Payments SDK [AMB-2753] ([ae56d6f](https://github.com/AmbossTech/sdk/commit/ae56d6fe5fa5a0f19bcfbe83efb9b29ed2ffbbda))


### Bug Fixes

* clear error when teamId is unresolvable with a service API key ([#23](https://github.com/AmbossTech/sdk/issues/23)) ([ebb4a0a](https://github.com/AmbossTech/sdk/commit/ebb4a0a6f51e438ca888517b1eba70e8caca3656))
* **payments:** surface payment preimage on send result [AMB-2789] ([#25](https://github.com/AmbossTech/sdk/issues/25)) ([944f494](https://github.com/AmbossTech/sdk/commit/944f494c88793108a86da0a301bd1f39a8d3a580))

## [0.1.1](https://github.com/AmbossTech/sdk/compare/payments-v0.1.0...payments-v0.1.1) (2026-07-07)


### Bug Fixes

* translate resource-call errors into ApiError ([#18](https://github.com/AmbossTech/sdk/issues/18)) ([82407cc](https://github.com/AmbossTech/sdk/commit/82407ccf3880988b35c02d637ec8a32db211860e))

## [0.1.0](https://github.com/AmbossTech/sdk/compare/payments-v0.0.1...payments-v0.1.0) (2026-07-01)


### Features

* add payment sending to the SDK [AMB-2725] ([235a820](https://github.com/AmbossTech/sdk/commit/235a82013461f5f9fd4fcd1e85157f53ba3b079e))
* add payment sending to the SDK [AMB-2725] ([aee9148](https://github.com/AmbossTech/sdk/commit/aee914809d7ab6529c3be0ad88146d86b66f404e))
* distinguish Bearer and service API keys [AMB-2725] ([#7](https://github.com/AmbossTech/sdk/issues/7)) ([c821dba](https://github.com/AmbossTech/sdk/commit/c821dbadc1418cbee5b4e42f28c7db6261609c42))
* expand PaymentsWallet fragment with asset, environment, and nodes fields [AMB-2672] ([#2](https://github.com/AmbossTech/sdk/issues/2)) ([920c4c5](https://github.com/AmbossTech/sdk/commit/920c4c530261d90439889a978792a501d950b0b1))
* initial ambosstech-sdk monorepo ([9b75d43](https://github.com/AmbossTech/sdk/commit/9b75d43578beccf7c9d457434c0debf21d518156))
* resync payments SDK with current rails schema [AMB-2725] ([d10b28e](https://github.com/AmbossTech/sdk/commit/d10b28e70d92bcfa6327c8ec237eabf7904b0523))
* resync payments SDK with current rails schema [AMB-2725] ([f54bf50](https://github.com/AmbossTech/sdk/commit/f54bf50ffcc041ee936480feed434445d217340b))
* support sandbox sends — create_send only, no node payment [AMB-2725] ([3c9a00b](https://github.com/AmbossTech/sdk/commit/3c9a00bea99ffb1824be7aa046636e291398280f))


### Bug Fixes

* base64-encode taproot group_key for litd send-payment [AMB-2725] ([787aa7d](https://github.com/AmbossTech/sdk/commit/787aa7d0b3a29d8a8a814d1ca508e016d3d4548e))
* correct litd asset send-payment request (endpoint + body) + diagnostics [AMB-2725] ([37cedab](https://github.com/AmbossTech/sdk/commit/37cedab520ce368cc825e3f010efe70f47fdccfc))
