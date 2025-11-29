# RHDH Deployment Guide for Funny Picture Plugin

This guide explains how to package and deploy the `funny-picture` plugin as a Dynamic Plugin for Red Hat Developer Hub (RHDH).

## Prerequisites

- Node.js and npm installed.
- Access to your RHDH instance configuration.
- `podman` (default) or `docker` installed.
- Access to an OCI registry (e.g., Quay.io).

## 1. Build the Dynamic Plugin

We use the `rhdh-cli` to export the plugin as a dynamic plugin.

Navigate to the plugin directory and run:

```bash
cd plugins/funny-picture
npm install
npm run export-dynamic
```

This command will generate a `dist-dynamic` directory containing the assets.

## 2. Deploy Options

You can deploy the plugin either by hosting the tarball locally/via HTTP, or by packaging it as an OCI image (recommended for production) using the `rhdh-cli`.

### Option A: OCI Image (Recommended)

This method packages the plugin into a container image and handles the build process automatically.

1.  **Package and Build the Image:**
    
    Ensure you are in the `plugins/funny-picture` directory.

    ```bash
    # Replace with your quay.io username
    QUAY_USER=your-username
    IMAGE_TAG=quay.io/$QUAY_USER/funny-picture:0.1.0
    
    # This command uses podman by default. Add --container-tool docker if needed.
    npm run package-oci -- --tag $IMAGE_TAG
    ```

2.  **Push to Registry:**

    ```bash
    podman push $IMAGE_TAG
    ```

3.  **Configuration (`dynamic-plugins.yaml`):**

    Update your RHDH configuration to pull from the OCI registry.

    ```yaml
    plugins:
      - package: 'oci://quay.io/your-username/funny-picture:0.1.0!funny-picture'
        disabled: false
        pluginConfig:
          dynamicPlugins:
            frontend:
              funny-picture:
                dynamicRoutes:
                  - path: /funny-picture
                    importName: FunnyPicturePage
                    menuItem:
                      text: Funny Picture
                      icon: sentiment_very_satisfied
    ```

### Option B: Local / HTTP Tarball

1.  **Pack the Plugin:**
    To create a deployable artifact (tarball), you must navigate **into** the `dist-dynamic` folder before packing.

    ```bash
    cd dist-dynamic
    npm pack
    cd ..
    ```

2.  **Configuration (`dynamic-plugins.yaml`):**
    ```yaml
    plugins:
      - package: 'file:///path/to/dist-dynamic/funny-picture-dynamic-0.1.0.tgz'
        # integrity: sha256:YOUR_HASH (optional but recommended)
        disabled: false
        pluginConfig:
          dynamicPlugins:
            frontend:
              funny-picture:
                dynamicRoutes:
                  - path: /funny-picture
                    importName: FunnyPicturePage
                    menuItem:
                      text: Funny Picture
                      icon: sentiment_very_satisfied
    ```

## 5. Content Security Policy (CSP) Configuration

If the plugin loads but the image is blocked (CSP error), you need to update the `app-config.yaml` of your RHDH instance to whitelist the image source (`picsum.photos`).

Add or update the `csp` section in your main `app-config.yaml` (or `app-config.local.yaml`):

```yaml
backend:
  # ... other backend config
  csp:
    # Use specific domains for security, or '*' to allow all image sources
    img-src: ["'self'", 'data:', '*']
```

This allows the frontend to load images from **any** external source (like `picsum.photos` or `avatars.dicebear.com`).

## 4. OCI Registry Authentication (Troubleshooting)

If you see an error like `skopeo copy ... returned non-zero exit status 1`, it often means the RHDH instance cannot pull the image from the registry due to authentication or visibility issues.

### Public Repository
Ensure your Quay.io repository is set to **Public** if you are not configuring image pull secrets.

### Private Repository
If the repository is private, you must configure an image pull secret in your Kubernetes/OpenShift namespace and link it to the service account or deployment.

1.  **Identify Service Account:**
    Check which service account your RHDH deployment uses:
    ```bash
    kubectl get deployment -n backstage -o jsonpath='{.items[*].spec.template.spec.serviceAccountName}'
    ```
    (It often defaults to `default` or `backstage-developer-hub`).

2.  **Create a Secret:**
    ```bash
    kubectl create secret docker-registry my-quay-secret \
      --docker-server=quay.io \
      --docker-username=YOUR_USERNAME \
      --docker-password=YOUR_PASSWORD
    ```

3.  **Link to Service Account:**
    Replace `default` with the service account name identified in step 1.
    ```bash
    kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "my-quay-secret"}]}'
    ```

