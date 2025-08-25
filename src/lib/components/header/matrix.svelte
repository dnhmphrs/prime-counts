<script>
  import { onMount } from 'svelte';
  import { mousePosition } from '$lib/store/store';

  function calculateMatrix(mouse) {
    const sin = Math.sin;
    const cos = Math.cos;
    const pi = Math.PI;
    const x = mouse.x * 0.2;
    const y = mouse.y * 0.2;

    // Define the matrix B
    const B = [
      [1.0 + 0.5 * sin(x * pi), 0.5 * cos(y * pi), 0.2 * sin(x)],
      [0.5 * cos(y * pi), 1.0 + 0.5 * cos(y * pi), 0.1 * sin(x * pi)],
      [0.2 * sin(x), 0.1 * cos(y * pi), 1.0 + 0.5 * sin(x * pi)]
    ];

    // Compute A = B^T * B to ensure positive definiteness
    const A = [
      [
        B[0][0] * B[0][0] + B[1][0] * B[1][0] + B[2][0] * B[2][0],
        B[0][0] * B[0][1] + B[1][0] * B[1][1] + B[2][0] * B[2][1],
        B[0][0] * B[0][2] + B[1][0] * B[1][2] + B[2][0] * B[2][2]
      ],
      [
        B[0][1] * B[0][0] + B[1][1] * B[1][0] + B[2][1] * B[2][0],
        B[0][1] * B[0][1] + B[1][1] * B[1][1] + B[2][1] * B[2][1],
        B[0][1] * B[0][2] + B[1][1] * B[1][2] + B[2][1] * B[2][2]
      ],
      [
        B[0][2] * B[0][0] + B[1][2] * B[1][0] + B[2][2] * B[2][0],
        B[0][2] * B[0][1] + B[1][2] * B[1][1] + B[2][2] * B[2][1],
        B[0][2] * B[0][2] + B[1][2] * B[1][2] + B[2][2] * B[2][2]
      ]
    ];

    return A;
  }

  $: dynamicMatrix = calculateMatrix($mousePosition);
</script>

<div class="matrix">
  <p>: Riemann Matrix :</p>
  <table>
    <tr>
    </tr>
    {#each dynamicMatrix as row}
      <tr>
        {#each row as cell}
          <td>{cell.toFixed(2)}</td>
        {/each}
      </tr>
    {/each}
  </table>
</div>

<style>
  .matrix {
    background: var(--background);
    height: fit-content;
    width: fit-content;
    padding: 0;
    z-index: 2;
    font-family: Arial, sans-serif;
  }
  table {
    border-collapse: collapse;
  }
  td {
    padding: 5px;
    border: 1px solid #444;
    text-align: center;
    min-width: 50px;
  }
  p{
    text-align: center;
    PADDING: 5PX;
  }
</style>
